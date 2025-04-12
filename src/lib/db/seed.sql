-- Insert categories into the categories table
INSERT INTO categories (id, name, slug, image, description, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Services', 'services', 'Sunt esse aliqua ullamco in incididunt consequat commodo.', '2020-06-24', '2020-07-21'),
  (gen_random_uuid(), 'Goods', 'goods', 'Sunt esse aliqua ullamco in incididunt consequat commodo.', '2020-06-23', '2020-06-26'),
  (gen_random_uuid(), 'Helth and Wellness', 'health-and-wellness', 'Sunt esse aliqua ullamco in incididunt consequat commodo.', '2020-06-21', '2020-06-25'),
  (gen_random_uuid(), 'Housing', 'housing', 'Sunt esse aliqua ullamco in incididunt consequat commodo.', '2020-06-22', '2020-06-27'),
  (gen_random_uuid(), 'Events', 'events', 'Sunt esse aliqua ullamco in incididunt consequat commodo.', '2020-06-27', '2020-06-28'),
  (gen_random_uuid(), 'Travel and Transportation', 'travel-and-transportation', 'Sunt esse aliqua ullamco in incididunt consequat commodo.', '2020-09-24', '2020-10-21'),
  (gen_random_uuid(), 'Freelance Gigs', 'freelance-gigs', 'Sunt esse aliqua ullamco in incididunt consequat commodo.', '2020-08-24', '2020-09-21'),
  (gen_random_uuid(), 'Miscellaneous', 'miscellaneous', 'Sunt esse aliqua ullamco in incididunt consequat commodo.', '2020-10-24', '2020-11-21')
ON CONFLICT (slug) DO NOTHING;