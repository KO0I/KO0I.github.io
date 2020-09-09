---
layout: post
title:  "openEMS, ADS on multiple systems"
date:   2020-09-08 14:39:23 -0700
categories: none
---

# Many Tools, Many Contexts

Here's some of what is being used, or has been used
* Remcom XFDTD (Linux install)
* Keysight EMPRO (Win10)
* Keysight ADS (Win10)
* openEMS (both Win10 and Linux)
* meep (both Win10 and Linux)
* Altium (Win10) -- learning
* KiCAD (Linux) -- I have stalled on using this
* openSCAD (Linux and maybe Windows) -- for when the other CAD tools are too
  much to bear

I have RemCom running in the Linux Context. I would prefer to use openEMS in
mostly the Linux context, but oh well, using both will be a learning experience! I will add links in future posts to resolve issues with specific tooling combinations.

I need to mount my Windows disk on my Linux side. That has no bad effects and
I have done it before on older machines such as my older ThinkPad laptops.

I would also *like* to use Windows seamlessly in the Linux context. Wine has
been a long-time struggle with some cases working wonderfully and others
failing to even install.

Booting the disk image virtually, using raw data options, etc. can achieve the
data-sharing aspect nicely, but this provokes Microsoft's licensing to
re-start and that would be a hassle since I must retain dual-boot.


Xen has been a very curious option that I focused on for a bit too long, but I have chosen to avoid it because of the
complexity involved, and again I'm not sure if my in-place Arch Linux install
would be screwed up becoming the dom0 or how to deal with the network bridge
aspect, let alone hardware. It seems like a fun project for something other
than the machine I have mostly configured happily. Besides, my study is of
FDTD methods, not entirely a matter of playing with computers, but there's a
lot of little issues behind getting each piece of software to run and to
become competent enough with them to troubleshoot them.
    

## Shared Data

A quick IT aside! I have Linux and Windows dual-boot on separate disks.

### Mount Windows on Linux

I used cfdisk to find the partition UUID for my two partitions on Windows. One
is the Main Disk, which is formatted as NTFS, and I might not want to always have it mounted. The other
is the shared data volume, which is exFAT as it is better supported than NTFS
on Linux. I used this information to create entries in my fstab, but I chose
to keep them commented out for now.

Right now I'll mount the drives on the Linux side on a need-as-used basis, or
see how often I access the Windows stuff from the Linux side.



# I might need to use ADS in both a Windows and Linux context

ADS is software from Keysight that does circuit analysis. It uses [Ptolemy](https://ptolemy.berkely.edu) and Keysight offers various interesting simulator extensions in line with the heterogenous systems intent of the project, such as thermal analysis. This interesting engine, combined with other quirks of proprietary software, made running this on Linux a hard time the last time I tried to run ADS post-install on a Linux machine.

## ADS on Linux

ADS installs without a hitch in Windows 10. I remember having trouble before
in Linux... I will take another swing at it!

So I downloaded the tar from Keysight and rand the SETUP.SH script as root.
Everything lives in /usr/local/ADSxxxx. Under bin I run ads and find several
things are missing. The file "ads" is a script that turns around executes actual
dynamic executables. I note the first one that is complained about and look at
what is linked to it:

    # ldd menv_exe | grep 'not found'

And I note the missing items. libicui18n.so.51 is not found for example.
Looking under:

    /usr/lib/icu 

But I also know of:

   /usr/local/ADSxxxx/lib/linux_x86_64/libicui18n.so.51.3

This is sort of familiar, but I remember there were problems even once I got
ldd to recognize the /usr/local location. I will revisit this later, but for now, it runs in Windows, so I will run ADS in Windows.

## ADS on Windows

Installation is easy.


# I might need to use meep in both a Windows and Linux context

I've used [meep](https://meep.readthedocs.io/en/latest) a bit on Linux previously, so using it again here is exciting.
I am not sure how it will be used in Windows yet.

It has been so long since I have used this tool,
that the interface to this tool is different than before. I don't mind, I've
been trying to get more Python into my life.

This open-source software imports just GDSII files...

Random con: hard to search for items around meep without getting weird
results.

## meep on Linux

Installed with a desired package manager. Simple enough.

## meep on Windows 

WSL ... could be a headache but if I can get to the point where I'm running
Jupyter notebooks in Windows 10 I'll be basically able to do the same thing
and share it readily.

# I might need to use openEMS in both a Windows and Linux context

openEMS seems to be most suited for a Linux-only environment, but I have WSL
on my Windows boot! I can share my openEMS data/scratch and run on Linux or
Windows and share that data. So, this seems easy enough.

For my self: what other software can be used seamlessly in Linux v. Windows? 

First: run through the tutorial in the first environment (my case, Linux):
[Tutorial](https://openems.de/index.php/Tutorial:_First_Steps.html)

## openEMS on Linux

Pretty much followed the guide to the letter. I had to run
addpath("/usr/share/CSXCAD/matlab") and addpath("/usr/share/openEMS/matlab")
at startup. I might want to create a standard script. I needed to install
appcsxcad separately.

Using the notch tutorial, I created a little m file. I realized that I can
output STL, so if things get real bad, I can use openSCAD to have things
imported, but there are a few items that need to exist. This will be discussed
in the future.

## openEMS on WSL 

There are some quirks to getting octave to be happy! Links coming soon...
