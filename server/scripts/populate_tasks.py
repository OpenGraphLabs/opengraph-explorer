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
    
    # Bedroom tasks
    "Check if the bed is made or unmade",
    "Look at the nightstand and identify all items on it",
    "Check if the closet door is open or closed",
    "Look for clothes that might be on the floor or chair",
    "Check if the curtains or blinds are open",
    "Look at the dresser and see what's on top of it",
    "Check if there are any electronics plugged in",
    "Look under the bed and see if anything is stored there",
    "Check if any shoes are left around the room",
    "Look at the mirror and check if it's clean",
    
    # Bathroom tasks
    "Check if the toilet seat is up or down",
    "Look at the sink and see if it's clean",
    "Check how many towels are hanging up",
    "Look in the medicine cabinet and see what's inside",
    "Check if the shower curtain is open or closed",
    "Look at the bathroom counter and identify all items",
    "Check if the trash can needs to be emptied",
    "Look for any wet towels on the floor",
    "Check if the toilet paper roll needs replacing",
    "Look at the bathtub and see if it's clean",
    
    # General household tasks
    "Walk around and check all doors to see if they're locked",
    "Look at each room and count how many lights are on",
    "Check all windows to see which ones are open",
    "Look for any water bottles around the house",
    "Check the front door area for any packages or mail",
    "Look around and identify any electronics that are left on",
    "Check all trash cans and see which ones are full",
    "Look for any items left on stairs or walkways",
    "Check the laundry area and see if clothes need washing",
    "Look around and identify any safety hazards or spills"
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