-- Seed data for vehicles table to populate the Inventory Overview

INSERT INTO public.vehicles (make, model, year, price, vin, mileage, location, status, image_url, class)
VALUES 
('ASTON MARTIN', 'DB12', 2024, 265000, 'VIN20ST907G12', 900, 'Dublin North', 'available', 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=600&auto=format&fit=crop', 'Hypercar'),
('PORSCHE', '911 GT3', 2023, 198500, 'VIN20S4S07V13', 1200, 'Dublin South', 'available', 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600&auto=format&fit=crop', 'Coupe'),
('FERRARI', 'F8 TRIBUTO', 2023, 325000, 'VIN20S1S07145', 450, 'Cork Central', 'available', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=600&auto=format&fit=crop', 'Hypercar'),
('LAMBORGHINI', 'REVUELTO', 2024, 550000, 'VIN2067S00213', 150, 'Dublin North', 'available', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop', 'Hypercar'),
('BENTLEY', 'BENTAYGA', 2023, 215000, 'VIN20S7B07412', 3200, 'Galway West', 'available', 'https://images.unsplash.com/photo-1621136531940-0e1a14a79901?q=80&w=600&auto=format&fit=crop', 'SUV');
