class OrderRepository:
    def __init__(self, cursor):
        self.cursor = cursor

    def get_orders_by_customer_id(self, customer_id):
        self.cursor.execute(
            """
            SELECT 
                o.order_id, o.order_code, o.created_at, o.status, o.total_amount,
                (SELECT item_name FROM order_items WHERE order_id = o.order_id LIMIT 1) as service_name
            FROM orders o
            WHERE o.customer_id = %s
            ORDER BY o.created_at DESC
            """,
            (customer_id,)
        )
        return self.cursor.fetchall()

    def get_order_by_code_or_id(self, order_id_or_code, customer_id):
        self.cursor.execute(
            """
            SELECT order_id, order_code, customer_name, customer_phone, pickup_address, delivery_address, status, total_amount, notes, created_at
            FROM orders
            WHERE (order_id::text = %s OR order_code = %s) AND customer_id = %s
            """,
            (order_id_or_code, order_id_or_code, customer_id)
        )
        return self.cursor.fetchone()

    def get_order_items(self, order_id):
        self.cursor.execute(
            """
            SELECT oi.item_name, oi.quantity, oi.unit_price, oi.line_total, s.unit_type
            FROM order_items oi
            LEFT JOIN services s ON oi.service_id = s.service_id
            WHERE oi.order_id = %s
            """,
            (order_id,)
        )
        return self.cursor.fetchall()

    def get_order_payment_method(self, order_id):
        self.cursor.execute(
            """
            SELECT method 
            FROM financial_transactions 
            WHERE order_id = %s AND (transaction_type = 'payment' OR transaction_type = 'revenue')
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (order_id,)
        )
        row = self.cursor.fetchone()
        return row[0] if row else None

    def get_order_status_history(self, order_id):
        self.cursor.execute(
            """
            SELECT status, note, changed_at 
            FROM order_status_history 
            WHERE order_id = %s 
            ORDER BY changed_at ASC
            """,
            (order_id,)
        )
        return self.cursor.fetchall()

    def cancel_order(self, order_id_or_code, customer_id):
        # Update the order status
        self.cursor.execute(
            """
            UPDATE orders 
            SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
            WHERE (order_id::text = %s OR order_code = %s) 
              AND customer_id = %s 
              AND status IN ('received', 'sorting')
            RETURNING order_id
            """,
            (order_id_or_code, order_id_or_code, customer_id)
        )
        row = self.cursor.fetchone()
        if not row:
            return None
        
        order_id = row[0]
        
        # Log the status transition to status history
        self.cursor.execute(
            """
            INSERT INTO order_status_history (order_id, status, note, changed_by)
            VALUES (%s, 'cancelled', 'Khách hàng yêu cầu hủy đơn hàng.', %s)
            """,
            (order_id, customer_id)
        )
        return order_id
