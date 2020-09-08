---
layout: post
title:  "openEMS"
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
* Altium (Win10)
* KiCAD (Linux)

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
FDTD methods, not entirely a matter of playing with computers
    
So, back to the project focus:


# I might need to use openEMS in both a Windows and Linux context

openEMS seems to be most suited for a Linux-only environment, but I have WSL
on my Windows boot! I can share my openEMS data/scratch and run on Linux or
Windows and share that data. So, this seems easy enough.

For my self: what other software can be used seamlessly in Linux v. Windows? 

First: run through the tutorial in the first environment (my case, Linux):
[Tutorial](https://openems.de/index.php/Tutorial:_First_Steps.html)

## Shared Data

### Mount Windows on Linux

Add fstab entry:

I used cfdisk to find the partition UUID for my two partitions on Windows. One
is the Main Disk, which is formatted as NTFS, and I might not want to always have it mounted. The other
is the shared data volume, which is exFAT as it is better supported than NTFS
on Linux.


## Setup on Linux

Pretty much followed the guide to the letter. I had to run
addpath("/usr/share/CSXCAD/matlab") and addpath("/usr/share/openEMS/matlab")
at startup. I might want to create a standard script.

## Steup on WSL 

There are some quirks! Links coming soon...
