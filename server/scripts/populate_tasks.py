"""
Script to populate the tasks table with predefined tasks from frontend
"""

import asyncio
import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Task
from app.config import settings

# Tasks data from client/src/components/robot-vision/types.ts
TASKS_DATA = {
    "kitchen": [
        {
            "id": "kitchen-counter",
            "title": "Capture the kitchen counter",
            "description": "Include cooking appliances and preparation areas",
            "targetObjects": ["microwave", "oven", "bottle", "cup", "bowl", "knife"],
            "requiredCount": 2,
            "icon": "🍳",
        },
        {
            "id": "kitchen-sink",
            "title": "Capture the sink area",
            "description": "Include faucet, dish rack, and cleaning supplies",
            "targetObjects": ["sink", "bottle", "cup", "spoon"],
            "requiredCount": 1,
            "icon": "🚰",
        },
        {
            "id": "kitchen-appliances",
            "title": "Capture major appliances",
            "description": "Include refrigerator, stove, or dishwasher",
            "targetObjects": ["refrigerator", "oven", "microwave"],
            "requiredCount": 1,
            "icon": "🔌",
        },
        {
            "id": "kitchen-storage",
            "title": "Capture storage areas",
            "description": "Include cabinets, pantry, or shelves with items",
            "targetObjects": ["bottle", "bowl", "cup"],
            "requiredCount": 2,
            "icon": "🗄️",
        },
    ],
    "living-room": [
        {
            "id": "living-seating",
            "title": "Capture the seating area",
            "description": "Include sofa, chairs, and coffee table",
            "targetObjects": ["couch", "chair", "tv", "remote"],
            "requiredCount": 2,
            "icon": "🛋️",
        },
        {
            "id": "living-entertainment",
            "title": "Capture the entertainment center",
            "description": "Include TV, speakers, and media devices",
            "targetObjects": ["tv", "remote", "laptop", "keyboard"],
            "requiredCount": 1,
            "icon": "📺",
        },
        {
            "id": "living-decor",
            "title": "Capture decorative elements",
            "description": "Include plants, artwork, or decorative items",
            "targetObjects": ["vase", "book", "clock", "potted plant"],
            "requiredCount": 1,
            "icon": "🖼️",
        },
        {
            "id": "living-lighting",
            "title": "Capture the room from window view",
            "description": "Include natural light sources and lamps",
            "targetObjects": ["couch", "chair", "tv"],
            "requiredCount": 1,
            "icon": "💡",
        },
    ],
    "closet": [
        {
            "id": "closet-clothes",
            "title": "Capture hanging clothes",
            "description": "Include organized clothing on hangers",
            "targetObjects": ["tie", "handbag", "suitcase"],
            "requiredCount": 1,
            "icon": "👔",
        },
        {
            "id": "closet-shoes",
            "title": "Capture shoe storage",
            "description": "Include shoe rack or floor shoe arrangement",
            "targetObjects": ["handbag", "suitcase", "backpack"],
            "requiredCount": 1,
            "icon": "👞",
        },
        {
            "id": "closet-accessories",
            "title": "Capture accessories area",
            "description": "Include bags, belts, or jewelry organizers",
            "targetObjects": ["handbag", "tie", "backpack"],
            "requiredCount": 1,
            "icon": "👜",
        },
        {
            "id": "closet-folded",
            "title": "Capture folded items",
            "description": "Include shelves with folded clothes or storage boxes",
            "targetObjects": ["suitcase", "handbag"],
            "requiredCount": 1,
            "icon": "📦",
        },
    ],
    "dining-room": [
        {
            "id": "dining-table",
            "title": "Capture the dining table",
            "description": "Include table setting and chairs",
            "targetObjects": ["dining table", "chair", "bowl", "cup"],
            "requiredCount": 2,
            "icon": "🍽️",
        },
        {
            "id": "dining-place-setting",
            "title": "Capture a place setting",
            "description": "Include plates, utensils, and glasses",
            "targetObjects": ["fork", "knife", "spoon", "bowl", "cup", "wine glass"],
            "requiredCount": 2,
            "icon": "🥄",
        },
        {
            "id": "dining-sideboard",
            "title": "Capture the sideboard or buffet",
            "description": "Include serving dishes or decorative items",
            "targetObjects": ["vase", "bowl", "bottle", "wine glass"],
            "requiredCount": 1,
            "icon": "🏺",
        },
        {
            "id": "dining-overview",
            "title": "Capture the full dining space",
            "description": "Include overall room arrangement",
            "targetObjects": ["dining table", "chair"],
            "requiredCount": 1,
            "icon": "🪑",
        },
    ],
}

# Add default desk task
DEFAULT_TASK = {
    "id": "desk",
    "title": "Take a picture of your desk",
    "description": "Capture your workspace including computer, keyboard, and mouse",
    "targetObjects": ["laptop", "keyboard", "mouse", "tv", "monitor"],
    "requiredCount": 1,
    "icon": "🖥️",
    "space": "default"
}


def populate_tasks():
    """Populate tasks table with predefined data"""
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
        
        # Add default task
        task = Task(
            id=DEFAULT_TASK["id"],
            title=DEFAULT_TASK["title"],
            description=DEFAULT_TASK["description"],
            space=DEFAULT_TASK["space"],
            icon=DEFAULT_TASK.get("icon"),
            target_objects=json.dumps(DEFAULT_TASK.get("targetObjects", [])),
            required_count=DEFAULT_TASK.get("requiredCount")
        )
        tasks_to_add.append(task)
        
        # Add space-specific tasks
        for space, tasks in TASKS_DATA.items():
            for task_data in tasks:
                task = Task(
                    id=task_data["id"],
                    title=task_data["title"],
                    description=task_data["description"],
                    space=space,
                    icon=task_data.get("icon"),
                    target_objects=json.dumps(task_data.get("targetObjects", [])),
                    required_count=task_data.get("requiredCount")
                )
                tasks_to_add.append(task)
        
        # Bulk insert all tasks
        session.bulk_save_objects(tasks_to_add)
        session.commit()
        
        print(f"Successfully populated {len(tasks_to_add)} tasks into the database.")
        
    except Exception as e:
        print(f"Error populating tasks: {e}")
        session.rollback()
    finally:
        session.close()


if __name__ == "__main__":
    populate_tasks()