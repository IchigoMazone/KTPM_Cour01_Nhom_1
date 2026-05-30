from app.repositories.booking_repository import BookingRepository

class BookingService:
    def __init__(self, connect):
        self.connect = connect

    def get_services(self):
        cursor = self.connect.cursor()
        try:
            repository = BookingRepository(cursor)
            services = repository.get_active_services()
            return [
                {
                    "service_id": str(s[0]),
                    "name": s[1],
                    "description": s[2],
                    "unit_type": s[3],
                    "base_price": float(s[4]),
                    "turnaround_hours": s[5]
                }
                for s in services
            ]
        finally:
            cursor.close()

    def create_booking(self, customer_id: str, customer_name: str, data: dict):
        cursor = self.connect.cursor()
        try:
            repository = BookingRepository(cursor)
            
            # Fetch service details to calculate estimation
            service = repository.get_service_by_id(data["service_id"])
            if not service:
                return {"success": False, "message": "Dịch vụ không tồn tại."}
            
            base_price = float(service[2])
            unit_type = service[3]
            
            # Estimate pricing: 5 kg default for per-kg services
            if unit_type == "kg":
                estimated_price = base_price * 5.0
            else:
                estimated_price = base_price
            
            result = repository.create_booking(
                customer_id=customer_id,
                contact_name=customer_name,
                service_id=data["service_id"],
                pickup_date=data["pickup_date"],
                time_slot=data["time_slot"],
                phone=data["phone"],
                address=data["address"],
                notes=data.get("notes"),
                estimated_price=estimated_price
            )
            
            self.connect.commit()
            return {
                "success": True,
                "message": "Đặt lịch lấy đồ thành công.",
                "booking_id": str(result[0]),
                "created_at": result[1]
            }
        except Exception as e:
            self.connect.rollback()
            return {"success": False, "message": f"Có lỗi xảy ra: {str(e)}"}
        finally:
            cursor.close()

    def get_user_bookings(self, customer_id: str):
        cursor = self.connect.cursor()
        try:
            repository = BookingRepository(cursor)
            bookings = repository.get_bookings_by_customer_id(customer_id)
            return [
                {
                    "booking_id": str(b[0]),
                    "customer_id": str(b[1]),
                    "service_id": str(b[2]) if b[2] else None,
                    "service_name": b[3],
                    "pickup_date": b[4],
                    "time_slot": b[5],
                    "contact_name": b[6],
                    "phone": b[7],
                    "address": b[8],
                    "estimated_weight": float(b[9]) if b[9] is not None else None,
                    "estimated_price": float(b[10]),
                    "status": b[11],
                    "notes": b[12],
                    "created_at": b[13]
                }
                for b in bookings
            ]
        finally:
            cursor.close()
