import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './lib/db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function test() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    return;
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client, { schema });

  try {
    console.log('Testing db connection...');
    const result = await db.select().from(schema.properties).limit(1);
    console.log('Connection successful, found properties:', result.length);
    
    console.log('Testing update builder...');
    const q = db.update(schema.properties).set({
        assignedVerifier: 'test',
        updatedAt: new Date()
    }).where(eq(schema.properties.id, '00000000-0000-0000-0000-000000000000'));
    
    console.log('Update builder created successfully');
    
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

test();
