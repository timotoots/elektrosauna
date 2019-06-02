# Elektrosauna
Source code for art installation "Elektrosauna" by Timo Toots.

Just for self documentation.

# Hardware:

2x AC Light Dimmer Module 4ch  
2x Solid state relay board 8ch  
1x 30ch DMX dimmer  
1x USB DMX adapter  
1x Raspberry Pi 3  
1x Arduino Mega  

# Software

## Install packages
```
sudo apt install git openvpn minicom
```
## Install new node.js
```
sudo bash  
curl -sL https://deb.nodesource.com/setup_12.x | bash -  
sudo apt-get install -y nodejs  
node -v  
```

## Install arduino-cli, follow instructions here:
https://github.com/arduino/arduino-cli
```
arduino-cli core update-index  
arduino-cli core install arduino:avr  
```
## Install Dimmer library
```
mkdir /home/pi/Arduino/libraries
cd /home/pi/Arduino/libraries  
git clone https://github.com/circuitar/Dimmer.git  
```
## Compile and upload Arduino code
```
/opt/elektrosauna/arduino/upload  
```

## Test Arduino serial
```
minicom -b 115200 -o -D /dev/ttyUSB0  
```

## Install uDMX-Linux
```
cd /home/pi/  
git clone https://github.com/markusb/uDMX-linux  
cd uDMX-linux  
make  
sudo cp uDMX /usr/local/bin/  
```

## Run the server
```
cd /opt/elektrosauna/server && node server.js
```

## Go to admin console
http://elektrosauna.local:3000

## Add to rc.local
```
su pi -c  '/opt/elektrosauna/startup.sh  &'
```

## Add to crontab
```
sudo crontab -e
0 4   *   *   *    /sbin/shutdown -r +5
```

