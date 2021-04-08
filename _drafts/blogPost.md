# Am I Documenting Enough?

So I bought a Saleae Pro for personal use off of eBay. I wanted to try it out; see if it was fake or broken or whatever. But check it on what?<br> 
Oh right, I had an old project from a few semesters ago, let's fire that up and try it. I used
a Saleae before to take screenshots of the functionality. Let's go!

## Hitting a wall with the old project!

I remembered which project it was in spite of the school projects being just
the numbers. My Project Euler entries are the same way: numbered like pieces
of Chopin's music.<br>

This is a poor way of organizing because an error involves a safari, but not intolerable... That's to come. (:<br>

I opened up MCUxpresso and managed to remember to use the QuickStart Panel
in the bottom-left. Using "Import project(s) from file system" is really
important. MCUxpresso is also morphing a little so I have to keep in mind
that at some point I might need to snapshot a working IDE version somehow.
Maybe a VM? Later ideas, I suppose.<br>

Okay, let's run it! Oh right, this code needs me to hook things up to that sensor, but how do I do
that?<br>
<br>
*Screech*
<br>
<br>
This is where my documentation fell short. I remembered that there was a
document with a picture in it with the board (The user manual), and another
with a table of all the pins (the Pinout). I added a README in my local docs
folder for the class after the fact to remind me of these two key ones among
the others. When you have a bunch of docs, sometimes a summary of what's what
is handy, especially if certain documents kept being useful over and over, can be useful when returning to it after a time. <br>

Once I figured out the right (I think) pins for I2C1 I hooked it up to the
sensor, compiled and got an error. Ok, probably not wiring the sensor up
right. I had to find the datasheet online to work out an answer to a few
things. I should bundle documentation or link it in the README for the
project.

## Ok but is the Saleae fake or not?

Well, I can just test the Saleae by hooking it up to a bus pirate I guess. I
actually wrote quite a bit before realizing I could use *two* debugging tools
off of each other.

#### Rabbit Hole:
[Python Control of a Saleae](https://github.com/ppannuto/python-saleae)

---

### Testing the Saleae: Setup:

* 1 Alleged Saleae Pro 8-channel Logic Analyzer
* 1 BusPirate v3.6b (Sparkfun Edition)
  * Firmware v5.10 (r559)  Bootloader v4.4

### Wiring:

* Bus Pirate Orange (I2C SDA) to '0' on Saleae 
* Bus Pirate Yellow (I2C SCL) to '1' on Saleae
* Bus Pirate Brown  (Gnd) to split GNDs for the Saleae signals

I open up bus pirate:

>  picocom -b 115200 /dev/buspirate

I set mode 'm' to 4 (I2C), set it to some low rate and try to fire it off. The
Saleae is stuck on "Waiting for Trigger"

(I have a udev rule to map the buspirate's USB identifier to a symlink, do
this with hardware you use a lot because it will get OLD OLD OLD to keep
tracks of things by anonymized ttyACMx or whatnot)

<br>...<br>

I was not able to get the trusty BusPirate to talk to the Saleae directly!
Like before with my class, I was not able to start it up. It was time to run
the self-test.

It consists of wiring the jumpers:
[![Part Name](https://i.imgur.com/1DrLeyE.jpeg)

<br>...and hitting ~ in the serial terminal to the buspirate. The analog pin
tests failed with the VPU and 5V rail coming in at 4.32 V...<br>

I did add a new case, just maybe that's causing a problem? 

## Not the first time

I suppose I have always been living out a certain attitude of not dwelling on
accomplishments. Partly to avoid regrettable design mistakes and partly just to move on from stressful school projects, often on to another.<br>

The answer to my question is "no". I am not documenting enough. I go through my
collection of cool old projects and I don't quite remember the quirk or two to
get it working like I did so cooly on the final demo day.
<br>
In the moment it wouldn't have been too hard or time-consuming to snap pics,
jot down notes, clarify ah-ha tidbits in notebooks in a more complete form.
That's a future habit for me to form, but for now here's a post-mortem.<br>

There's a lot of issues I had/have that feed into this behavior, some of which are tragic, not my fault, and are ultimately tempting potential excuses to shuffle into and dwell on.<br> 

But I want to get better and I can't if I am in denial about my lack of thoroughness when it comes to docs, especially given how scatterbrained and forgetful I am, I really have to do better.
This post isn't supposed to be a bunch of self-criticism for its own sake, but rather a walk-through after a long pause to consider what would make for ergonomic documentation from the perspective of a "user".<br> 

I have concise down for the moment, but if I am to be a successful engineer I need to be able to at least communicate my own work to my future self, who will have forgotton most everything because of all the interesting stuff I do.<br>

## An exercise: make that README better

Like I said, I have an old school project, the fourth in the University of Colorado PES graduate program. It's a simple enough project. I2C communications with a little sensor. The program has a few features to trigger at a certain cold temperature and also have an error condition when comms are dead (the state I encountered when I used all of my own documentation and no leads).<br>

I didn't have much left to go off of to debug what I had before at demo time
and this is terrible. I've lost some of the knowledge that I worked for in not
documenting, because memory is frail.<br>

The goal of this project is to deliver a diff and checkin for my git repo for
this class project. The changes should be enough to get me able to:

* Debug the sensor with the bus-pirate
* Use the firmware I wrote to watch the sensor
* Maybe try to re-demo by cooling the sensor. 

### Existing documentation

You can see the old edits on my github from Fall 2019. There are some details,
such as some of the buspirate commands that I used in debugging,
but let's just say there's not enough. What did I need to know to get things
working? 

* The wiring for the bus-pirate
  * I had to look in my notebook and datasheet to remember the alert pin.
* The wiring for the FRDM board
* Noting how to handle using one exclusively-or the other I2C master from the
  FRDM board or the buspirate when debugging, but how to use the buspirate as
a sniffer
* What's the I2C rate?
* What are the pins on the FRDM board? I don't have my case marked and even if
  I did, what if another "user" wanted to use this firmware? They'd be forced
to read the same documentation I did...


## Diving in

Let
