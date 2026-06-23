import pandas as pd
import random
import os

# Test case structures based on requirements
MODULES = {
    "Authentication": 50,
    "Home Dashboard": 40,
    "Workout": 80,
    "AI Detection": 50,
    "Favorites": 25,
    "Schedule": 25,
    "Progress": 40,
    "Profile": 30,
    "Sync": 20,
    "Navigation": 20,
    "API Validation": 10,
    "Database Validation": 10
}

FEATURES_BY_MODULE = {
    "Authentication": ["Signup", "Login", "Logout", "Google Login", "Invalid Credentials", "Empty Fields", "Session Handling", "Token Validation", "Account Persistence", "Multi Device Login"],
    "Home Dashboard": ["Dashboard Loading", "Calories Burned", "Workouts Done", "Avg Accuracy", "Day Streak", "AI Recommendations", "User Statistics", "Activity Feed", "Performance Cards"],
    "Workout": ["Workout Listing", "Workout Search", "Category Filters", "Workout Details", "Start Workout", "Stop Workout", "Save Workout", "Workout Summary", "Exercise Instructions", "Video References"],
    "AI Detection": ["Camera Access", "Camera Permissions", "Skeleton Rendering", "Pose Detection", "Joint Detection", "Rep Counter", "Set Counter", "Calories Calculation", "Accuracy Calculation", "Voice Feedback", "Session Completion"],
    "Favorites": ["Add Favorite", "Remove Favorite", "Favorite Persistence", "Favorite Synchronization", "Favorite Filtering"],
    "Schedule": ["Create Schedule", "Edit Schedule", "Delete Schedule", "Calendar View", "Repeat Schedule", "Reminder Validation", "Synchronization"],
    "Progress": ["Workout History", "Progress Charts", "Weekly Analytics", "Monthly Analytics", "Calories Trends", "Accuracy Trends", "Streak Calculations", "Goal Tracking"],
    "Profile": ["Profile Update", "Avatar Update", "Goal Update", "Settings Update", "Password Update", "Account Preferences"],
    "Sync": ["Website to Mobile Sync", "Mobile to Website Sync", "Favorites Sync", "Schedule Sync", "Workout History Sync", "Progress Sync"],
    "Navigation": ["Bottom Navigation", "Screen Routing", "Back Navigation", "Deep Linking", "State Persistence"],
    "API Validation": ["API Success", "API Error Handling", "Invalid Requests", "Authorization Validation"],
    "Database Validation": ["Workout Save", "Favorites Save", "Schedule Save", "Progress Save", "User Isolation"]
}

def generate_cases():
    test_cases = []
    case_id_counter = 1
    
    for module, count in MODULES.items():
        features = FEATURES_BY_MODULE[module]
        for i in range(count):
            feature = features[i % len(features)]
            test_id = f"TC_MOB_{module.replace(' ', '_')}_{str(case_id_counter).zfill(3)}"
            scenario = f"Validate {feature} functionality under various conditions (Iteration {i+1})"
            precondition = f"User is on the {module} screen" if module != "Authentication" else "App is freshly installed/opened"
            steps = f"1. Navigate to {feature}\n2. Perform standard interactions\n3. Verify UI state changes"
            expected = f"The {feature} action should complete successfully according to requirements"
            priority = "High" if i % 3 == 0 else ("Medium" if i % 2 == 0 else "Low")
            severity = "Critical" if "Login" in feature or "Sync" in feature else ("Major" if i % 2 == 0 else "Minor")
            auto_candidate = "Yes"
            status = "Draft"
            
            test_cases.append({
                "Test Case ID": test_id,
                "Module": module,
                "Feature": feature,
                "Test Scenario": scenario,
                "Precondition": precondition,
                "Test Steps": steps,
                "Expected Result": expected,
                "Priority": priority,
                "Severity": severity,
                "Automation Candidate": auto_candidate,
                "Status": status
            })
            case_id_counter += 1
            
    return test_cases

def main():
    print("Generating Mobile Test Cases...")
    cases = generate_cases()
    df = pd.DataFrame(cases)
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(output_dir, 'Mobile_TestCases.xlsx')
    
    df.to_excel(file_path, index=False, sheet_name='Test Cases')
    print(f"Successfully generated {len(cases)} test cases in {file_path}")

if __name__ == "__main__":
    main()
