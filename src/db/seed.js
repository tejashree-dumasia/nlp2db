import { pool } from './pool.js';

const seedDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting database seed...');

    // 1. Drop existing tables to ensure a clean slate (Idempotent)
    await client.query(`DROP TABLE IF EXISTS orders;`);
    await client.query(`DROP TABLE IF EXISTS users;`);

    // 2. Create 'users' table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        signup_date DATE DEFAULT CURRENT_DATE
      );
    `);
    console.log('✅ Created "users" table.');

    // 3. Create 'orders' table with a explicit Foreign Key for AI context
    await client.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        order_date DATE DEFAULT CURRENT_DATE
      );
    `);
    console.log('✅ Created "orders" table.');

    // 4. Insert Seed Data
    // Note: Parameterized queries are standard for user input, but raw strings 
    // are acceptable here for hardcoded developer seeding.
    await client.query(`
      INSERT INTO users (name, email, signup_date) VALUES 
      ('Alice Smith', 'alice@example.com', '2023-01-15'),
      ('Bob Jones', 'bob@example.com', '2023-03-22'),
      ('Charlie Brown', 'charlie@example.com', '2023-06-10');
    `);

    await client.query(`
      INSERT INTO orders (user_id, amount, status, order_date) VALUES 
      (1, 250.00, 'completed', '2023-02-01'),
      (1, 250.00, 'completed', '2023-04-15'),
      (2, 450.00, 'completed', '2023-05-20'),
      (3, 50.00, 'pending', '2023-07-01');
    `);
    
    console.log('✅ Inserted seed data successfully.');

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  } finally {
    client.release();
    await pool.end(); // Close the pool so the Node process can exit
  }
};

seedDatabase();