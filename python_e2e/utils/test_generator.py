import os
import glob
import re

PAYLOADS = [
    {"desc": "Empty string", "value": ""},
    {"desc": "Whitespace string", "value": "    "},
    {"desc": "SQL Injection 1", "value": "' OR 1=1 --"},
    {"desc": "SQL Injection 2", "value": "admin' --"},
    {"desc": "XSS Payload 1", "value": "<script>alert(1)</script>"},
    {"desc": "XSS Payload 2", "value": "\"><img src=x onerror=alert(1)>"},
    {"desc": "Large string 255", "value": "A" * 255},
    {"desc": "Large string 1000", "value": "A" * 1000},
    {"desc": "Emojis", "value": "🚀🔥😎"},
    {"desc": "Special characters", "value": "!@#$%^&*()_+-=[]{}|;':,.<>/?`~"},
    {"desc": "Unicode characters", "value": "你好世界"},
    {"desc": "Boundary min-1", "value": "a"},
    {"desc": "Valid string", "value": "John Doe"},
    {"desc": "Numeric string", "value": "1234567890"},
    {"desc": "Negative number", "value": "-12345"},
    {"desc": "Decimal number", "value": "12.345"},
    {"desc": "Boolean true", "value": "true"},
    {"desc": "Boolean false", "value": "false"},
    {"desc": "Null string", "value": "null"},
    {"desc": "Command injection", "value": "; ls -la"},
    {"desc": "Path traversal", "value": "../../../etc/passwd"}
]

def generate_test_cases():
    """Scans frontend src and yields a list of test cases (component, field_name, payload)."""
    src_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'frontend', 'src')
    files = glob.glob(os.path.join(src_dir, '**', '*.tsx'), recursive=True)
    
    test_cases = []
    
    # Regex to find inputs and names
    input_pattern = re.compile(r'<input[^>]*>')
    name_pattern = re.compile(r'name=["\']([^"\']+)["\']')
    
    for file_path in files:
        component_name = os.path.basename(file_path).replace('.tsx', '')
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        inputs = input_pattern.findall(content)
        fields = set()
        for tag in inputs:
            match = name_pattern.search(tag)
            if match:
                fields.add(match.group(1))
                
        for field in fields:
            for payload in PAYLOADS:
                # Tuple: (component_name, field_name, payload_desc, payload_value)
                test_cases.append((component_name, field, payload["desc"], payload["value"]))
                
    return test_cases
