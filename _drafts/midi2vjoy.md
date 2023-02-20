## Problems with Driver

Using the official driver causes the device to no longer appear as a MIDI device, like in any DAW as well as vJoy. Had to system restore to recover from this!

## Remap Headaches

Korg nanokontroller thru midi2vjoy doesn't seem to pass along the remap

Followed the instructions here: https://github.com/c0redumb/midi2vjoy

Buttons are "supposed" to have an m\_type of 144, but instead the korg control surface returns 176!

If I use 176, midi2vjoy dutifully maps the button presses to what the configuration file directs, but it does not actually register when I use Set up USB Controllers and such. The other HOTAS registers buttons, hat and slider, but the virtual joystick mapping only translates the sliders.

Crazy idea: have the 33 buttons be mapped to "sliders". Try it out with file edits first

kk2_mix.conf has a blend of SOLO being sent out as "joystick" signals.Only two signals come through?? 

Ok the hack needed is so evil, ugh. It would call for 19 vJoy devices for sliders 0 and 1 to be used for the buttons. This might be above the max of what vJoy can do... this is a poor hack.

I can't state SL2 to create a new arbitrary slider. There is some constraint on the other axes but not Slider and Dial in vJoy Device properties. 

Okay, time to file an issue, because the next step is to start mucking with the source. There's a PR that supports a wider range of equipment, by allowing for other numbers than 144 and 176. Trouble is, for the nanoKontrol, so make the buttons, well buttons, I might have to have a special branch just for nanokontrol's buttons.
