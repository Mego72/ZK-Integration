@echo off
cd /d C:\ZK-Integration\backend
netsh advfirewall firewall add rule name="ZK Attendance App Port 5000" dir=in action=allow protocol=TCP localport=5000 > C:\ZK-Integration\firewall.log 2>&1
node src/server.js > C:\ZK-Integration\server_output.log 2>&1
