import socket
import json
import time

def send_command(command, parameters=None):
    # Create a socket connection
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(('localhost', 9899))
    
    # Create command object
    cmd = {
        "command": command.lower(),  # ensure command is lowercase
        "parameters": parameters if parameters is not None else []
    }
    
    # Send command
    cmd_str = json.dumps(cmd) + '\n'
    print(f"Sending: {cmd_str.strip()}")  # Debug output
    sock.send(cmd_str.encode('utf-8'))
    
    # Read response
    response = sock.recv(4096).decode('utf-8')
    print(f"Received: {response.strip()}")  # Debug output
    sock.close()
    
    # Parse response
    try:
        return json.loads(response)
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")  # Debug output
        return {'status': 'NOK', 'data': f'Failed to parse response: {response}'}

def main():
    try:
        # Test configShow command
        print("\nTesting configShow command:")
        result = send_command('configshow')
        print(json.dumps(result, indent=2))
        
        if result['status'] == 'OK':
            # Test configSave command with the same content
            print("\nTesting configSave command with the same content:")
            config_content = result['data']
            if isinstance(config_content, bytes):
                config_content = config_content.decode('utf-8')
            result = send_command('configsave', [config_content])
            print(json.dumps(result, indent=2))
            
            # Test configShow again to verify the save
            print("\nVerifying config after save:")
            result = send_command('configshow')
            print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main() 