
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change Requests table
CREATE TABLE change_requests (
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
CREATE TABLE cr_developers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  change_request_id UUID REFERENCES change_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(change_request_id, user_id)
);

-- Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  change_request_id UUID REFERENCES change_requests(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status VARCHAR(50) CHECK (status IN ('not-started', 'in-progress', 'completed')) DEFAULT 'not-started',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cr_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable read access for all change_requests" ON change_requests FOR SELECT USING (true);
CREATE POLICY "Enable read access for all cr_developers" ON cr_developers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all tasks" ON tasks FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all change_requests" ON change_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all cr_developers" ON cr_developers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all tasks" ON tasks FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable update for all change_requests" ON change_requests FOR UPDATE USING (true);
CREATE POLICY "Enable update for all cr_developers" ON cr_developers FOR UPDATE USING (true);
CREATE POLICY "Enable update for all tasks" ON tasks FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON users FOR DELETE USING (true);
CREATE POLICY "Enable delete for all change_requests" ON change_requests FOR DELETE USING (true);
CREATE POLICY "Enable delete for all cr_developers" ON cr_developers FOR DELETE USING (true);
CREATE POLICY "Enable delete for all tasks" ON tasks FOR DELETE USING (true);
