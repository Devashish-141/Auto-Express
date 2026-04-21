-- Seed Representatives to resolve foreign key constraints in transactions
INSERT INTO public.reps (rep_code, name)
VALUES 
    ('NICK-01', 'Nickson'),
    ('AMANDA-01', 'Amanda'),
    ('DEMO-REP', 'Demo Representative')
ON CONFLICT (rep_code) DO NOTHING;
