"""
Script to populate the tasks table with predefined robot tasks
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Task
from app.config import settings

# Robot tasks data - simple task names for robot execution
ROBOT_TASKS = [
    # Kitchen tasks
    "Open the refrigerator and check what ingredients are inside",
    "Check how many dishes are piled up in the sink",
    "Look at the countertop and identify all cooking utensils",
    "Open the microwave and see if there's anything inside",
    "Check if the coffee maker is turned on",
    "Look inside the pantry and count how many bottles there are",
    "Check if the dishwasher is running",
    "Look at the stove and check if any burners are on",
    "Open kitchen cabinets and see what's stored inside",
    "Check the trash can and see if it needs to be emptied",
    
    # Living room tasks
    "Look at the TV and check if it's on or off",
    "Check the couch for any items left on it",
    "Look around the coffee table and identify all objects",
    "Check if any windows are open in the room",
    "Look for the TV remote and see where it is",
    "Check if there are any books or magazines on the table",
    "Look at the plants and check if they need watering",
    "Check if any lights are turned on in the room",
    "Look for any electronic devices that are charging",
    "Check the floor for any items that need to be picked up",
]


def populate_tasks():
    """Populate tasks table with robot tasks"""
    # Create database engine - convert asyncpg to psycopg2 for sync operations
    db_url = str(settings.database_url).replace("+asyncpg", "")
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    session = SessionLocal()
    
    try:
        # Check if tasks already exist
        existing_tasks = session.query(Task).count()
        if existing_tasks > 0:
            print(f"Tasks table already has {existing_tasks} entries. Skipping population.")
            return
        
        tasks_to_add = []
        
        # Add robot tasks
        for task_name in ROBOT_TASKS:
            task = Task(name=task_name)
            tasks_to_add.append(task)
        
        # Bulk insert all tasks
        session.bulk_save_objects(tasks_to_add)
        session.commit()
        
        print(f"Successfully populated {len(tasks_to_add)} robot tasks into the database.")
        
        # Print sample tasks
        print("\nSample tasks added:")
        for i, task in enumerate(tasks_to_add[:5]):
            print(f"  {i+1}. {task.name}")
        print(f"  ... and {len(tasks_to_add) - 5} more tasks")
        
    except Exception as e:
        print(f"Error populating tasks: {e}")
        session.rollback()
    finally:
        session.close()


if __name__ == "__main__":
    populate_tasks()