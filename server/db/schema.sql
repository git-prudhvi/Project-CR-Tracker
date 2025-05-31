
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change Requests table
CREATE TABLE IF NOT EXISTS change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) CHECK (status IN ('pending', 'in-progress', 'completed', 'blocked')) DEFAULT 'pending',
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CR Developers (many-to-many relationship)
CREATE TABLE IF NOT EXISTS cr_developers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  change_request_id UUID REFERENCES change_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(change_request_id, user_id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  change_request_id UUID REFERENCES change_requests(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status VARCHAR(50) CHECK (status IN ('not-started', 'in-progress', 'completed')) DEFAULT 'not-started',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (but allow all operations for simplicity)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cr_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on change_requests" ON change_requests;
CREATE POLICY "Allow all operations on change_requests" ON change_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on cr_developers" ON cr_developers;
CREATE POLICY "Allow all operations on cr_developers" ON cr_developers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
