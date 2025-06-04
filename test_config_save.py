import socket
import json
import time

def send_command(command, parameters=None):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(('localhost', 9899))
    cmd = {
        'command': command,
        'parameters': parameters if parameters is not None else []
    }
    cmd_str = json.dumps(cmd) + '\n'
    print(f"Sending: {cmd_str.strip()}")
    sock.send(cmd_str.encode())
    response = sock.recv(4096).decode()
    print(f"Received: {response.strip()}")
    sock.close()
    return json.loads(response)

# First get current config
print("\nGetting current config:")
response = send_command('configshow')
current_config = response['data']

# Add our test line at the end
modified_config = current_config + "\nconfigChanged=1\n"

# Save the modified config
print("\nSaving modified config:")
response = send_command('configsave', [modified_config])

# Wait a moment for the file operations to complete
time.sleep(1)

# Verify the changes
print("\nVerifying changes:")
response = send_command('configshow')
print("\nVerification complete. Please check:")
print("1. A backup file should exist in conf/ directory")
print("2. The main config file should contain 'configChanged=1' at the end") 