class BookingRepository:
    def __init__(self, cursor):
        self.cursor = cursor

    def get_active_services(self):
        self.cursor.execute(
            """
            SELECT service_id, name, description, unit_type, base_price, turnaround_hours 
            FROM services 
            WHERE is_active = TRUE 
            ORDER BY category_id, name
            """
        )
        return self.cursor.fetchall()

    def get_service_by_id(self, service_id):
        self.cursor.execute(
            """
            SELECT service_id, name, base_price, unit_type 
            FROM services 
            WHERE service_id = %s
            """,
            (service_id,)
        )
        return self.cursor.fetchone()

    def create_booking(self, customer_id, contact_name, service_id, pickup_date, time_slot, phone, address, notes, estimated_price):
        self.cursor.execute(
            """
            INSERT INTO pickup_bookings (
                customer_id, contact_name, service_id, pickup_date, 
                time_slot, phone, address, notes, estimated_price, status
            ) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending') 
            RETURNING booking_id, created_at
            """,
            (customer_id, contact_name, service_id, pickup_date, time_slot, phone, address, notes, estimated_price)
        )
        return self.cursor.fetchone()

    def get_bookings_by_customer_id(self, customer_id):
        self.cursor.execute(
            """
            SELECT 
                b.booking_id, b.customer_id, b.service_id, s.name as service_name, 
                b.pickup_date, b.time_slot, b.contact_name, b.phone, b.address, 
                b.estimated_weight, b.estimated_price, b.status, b.notes, b.created_at 
            FROM pickup_bookings b 
            LEFT JOIN services s ON b.service_id = s.service_id 
            WHERE b.customer_id = %s 
            ORDER BY b.created_at DESC
            """,
            (customer_id,)
        )
        return self.cursor.fetchall()
