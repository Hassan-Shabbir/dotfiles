unclutter -idle 1 -root &
xinput set-prop "SynPS/2 Synaptics TouchPad" "Device Enabled" 0 &
setxkbmap -option caps:swapescape &
xset +dpms &
set dpms 0 0 300 &
sh -c 'sleep 2 ; xset m 3 3' &
sh -c 'sleep 2.1 ; xinput --set-prop "TPPS/2 IBM TrackPoint" "Device Accel Profile" 7' &
sh -c 'sleep 2.2 ; xinput --set-prop "TPPS/2 IBM TrackPoint" "Device Accel Velocity Scaling" 2.0' &
exec xmonad &
