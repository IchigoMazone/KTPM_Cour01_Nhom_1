from app.repositories.order_repository import OrderRepository
from datetime import datetime

class OrderService:
    def __init__(self, connect):
        self.connect = connect

    def _format_price(self, amount):
        if amount is None:
            return "0đ"
        return f"{int(amount):,}đ".replace(",", ".")

    def _map_status(self, db_status):
        # Maps database English statuses to the 4 main Vietnamese categories expected by the frontend
        status_map = {
            'received': ('Đang giặt', 'default'),
            'sorting': ('Đang giặt', 'default'),
            'washing': ('Đang giặt', 'default'),
            'drying': ('Đang giặt', 'default'),
            'folding': ('Đang giặt', 'default'),
            'ready': ('Sẵn sàng giao', 'success'),
            'delivering': ('Sẵn sàng giao', 'success'),
            'completed': ('Hoàn tất', 'success'),
            'cancelled': ('Đã hủy', 'danger')
        }
        return status_map.get(db_status, ('Đang giặt', 'default'))

    def get_user_orders(self, customer_id: str):
        cursor = self.connect.cursor()
        try:
            repository = OrderRepository(cursor)
            orders = repository.get_orders_by_customer_id(customer_id)
            
            result = []
            for o in orders:
                order_id, order_code, created_at, status, total_amount, service_name = o
                
                status_display, tone = self._map_status(status)
                date_str = created_at.strftime("%d/%m/%Y") if created_at else ""
                
                result.append({
                    "order_id": str(order_id),
                    "code": order_code,
                    "date": date_str,
                    "service": service_name or "Dịch vụ khác",
                    "total": self._format_price(total_amount),
                    "status": status_display,
                    "status_display": status_display,
                    "tone": tone,
                    "total_amount": float(total_amount) if total_amount is not None else 0.0
                })
            return result
        finally:
            cursor.close()

    def get_user_order_detail(self, order_id_or_code: str, customer_id: str):
        cursor = self.connect.cursor()
        try:
            repository = OrderRepository(cursor)
            order = repository.get_order_by_code_or_id(order_id_or_code, customer_id)
            if not order:
                return None
            
            order_id, order_code, customer_name, customer_phone, pickup_address, delivery_address, db_status, total_amount, notes, created_at = order
            
            # Fetch order items
            items_raw = repository.get_order_items(order_id)
            items = []
            total_qty_units = 0.0
            unit_types_seen = set()
            
            for item in items_raw:
                item_name, quantity, unit_price, line_total, unit_type = item
                qty_val = float(quantity)
                unit_label = unit_type if unit_type else "cái"
                
                items.append({
                    "name": item_name,
                    "qty": f"{qty_val:g} {unit_label}",
                    "price": self._format_price(line_total)
                })
                total_qty_units += qty_val
                if unit_label:
                    unit_types_seen.add(unit_label)

            # Build a summary weight/quantity string
            qty_summary = ""
            if len(unit_types_seen) == 1:
                qty_summary = f"{total_qty_units:g} {list(unit_types_seen)[0]}"
            else:
                qty_summary = f"{len(items)} món"

            # Fetch payment method
            pay_method = repository.get_order_payment_method(order_id)
            payment_display = "Thanh toán khi nhận đồ (COD)"
            if pay_method == 'momo':
                payment_display = "Ví điện tử MoMo"
            elif pay_method == 'vnpay':
                payment_display = "Ví điện tử VNPAY"
            elif pay_method == 'bank':
                payment_display = "Chuyển khoản Ngân hàng"

            # Fetch history and build timeline
            history = repository.get_order_status_history(order_id)
            timeline = self._build_timeline(db_status, history)

            status_display, tone = self._map_status(db_status)

            return {
                "code": order_code,
                "customerName": customer_name,
                "phone": customer_phone or "",
                "address": delivery_address or pickup_address or "",
                "paymentMethod": payment_display,
                "notes": notes or "Không có ghi chú.",
                "weight": qty_summary,
                "total": self._format_price(total_amount),
                "status": status_display,
                "status_display": status_display,
                "tone": tone,
                "items": items,
                "timeline": timeline
            }
        finally:
            cursor.close()

    def cancel_user_order(self, order_id_or_code: str, customer_id: str):
        cursor = self.connect.cursor()
        try:
            repository = OrderRepository(cursor)
            order_id = repository.cancel_order(order_id_or_code, customer_id)
            if not order_id:
                return {
                    "success": False,
                    "message": "Không thể hủy đơn hàng. Đơn hàng chỉ có thể hủy khi đang ở trạng thái chờ nhận đồ."
                }
            self.connect.commit()
            return {
                "success": True,
                "message": f"Đã hủy đơn hàng {order_id_or_code} thành công!"
            }
        except Exception as e:
            self.connect.rollback()
            return {
                "success": False,
                "message": f"Có lỗi xảy ra khi hủy đơn hàng: {str(e)}"
            }
        finally:
            cursor.close()

    def _build_timeline(self, current_status: str, history: list):
        history_dict = {h[0]: h for h in history}
        
        status_rank = {
            'received': 1,
            'sorting': 2,
            'washing': 3,
            'drying': 3,
            'folding': 3,
            'ready': 4,
            'delivering': 5,
            'completed': 6,
            'cancelled': -1
        }

        def fmt_time(dt):
            return dt.strftime("%d/%m/%Y %H:%M") if dt else "--:--"

        if current_status == 'cancelled':
            received_h = history_dict.get('received') or history_dict.get('sorting')
            cancelled_h = history_dict.get('cancelled')
            
            return [
                {
                    "stage": "Đã nhận đồ",
                    "time": fmt_time(received_h[2]) if received_h else "--:--",
                    "status": "completed" if received_h else "pending",
                    "desc": received_h[1] if received_h else "Nhân viên Panda đã nhận túi đồ từ khách hàng."
                },
                {
                    "stage": "Đã hủy đơn",
                    "time": fmt_time(cancelled_h[2]) if cancelled_h else "--:--",
                    "status": "cancelled",
                    "desc": cancelled_h[1] if cancelled_h else "Khách hàng yêu cầu hủy đơn hàng. Đã hoàn tất hoàn trả đồ nhận."
                }
            ]

        stages = [
            {
                "name": "Đã nhận đồ",
                "statuses": ['received'],
                "default_desc": "Nhân viên Panda đã nhận túi đồ từ khách hàng."
            },
            {
                "name": "Phân loại",
                "statuses": ['sorting'],
                "default_desc": "Đồ giặt đã được phân loại theo chất liệu và màu sắc."
            },
            {
                "name": "Đang giặt",
                "statuses": ['washing', 'drying', 'folding'],
                "default_desc": "Đồ đang được giặt máy bằng nước giặt hữu cơ sinh học."
            },
            {
                "name": "Sấy & gấp",
                "statuses": ['ready'],
                "default_desc": "Sấy khô ở nhiệt độ thích hợp và xếp gọn vào túi."
            },
            {
                "name": "Giao lại",
                "statuses": ['delivering', 'completed'],
                "default_desc": "Giao đồ sạch tận tay khách hàng theo lịch hẹn."
            }
        ]

        current_stage_idx = -1
        for idx, stage in enumerate(stages):
            if current_status in stage["statuses"]:
                current_stage_idx = idx
                break
        
        current_rank = status_rank.get(current_status, 1)

        timeline = []
        for idx, stage in enumerate(stages):
            stage_history = None
            for s in stage["statuses"]:
                if s in history_dict:
                    stage_history = history_dict[s]
                    break

            if current_status == 'completed':
                status_state = "completed"
            elif current_stage_idx == -1:
                max_stage_rank = max(status_rank.get(s, 1) for s in stage["statuses"])
                if current_rank > max_stage_rank:
                    status_state = "completed"
                elif current_rank == max_stage_rank:
                    status_state = "current"
                else:
                    status_state = "pending"
            else:
                if idx < current_stage_idx:
                    status_state = "completed"
                elif idx == current_stage_idx:
                    status_state = "current"
                else:
                    status_state = "pending"

            desc = stage_history[1] if (stage_history and stage_history[1]) else stage["default_desc"]
            time_str = fmt_time(stage_history[2]) if stage_history else "--:--"
            
            stage_name = stage["name"]
            if stage_name == "Giao lại" and current_status == "delivering":
                stage_name = "Giao lại (Đang giao)"
            elif stage_name == "Giao lại" and current_status == "completed":
                stage_name = "Giao lại hoàn tất"

            timeline.append({
                "stage": stage_name,
                "time": time_str,
                "status": status_state,
                "desc": desc
            })

        return timeline
