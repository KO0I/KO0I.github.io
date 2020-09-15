---
layout: post
title:  "Migrating to an SSD"
date:   2020-09-08 14:39:23 -0700
categories: none
---

# The Problem

Platter drives are slow. Windows is bulky. The two combined is very
frustraing! Especially knowing that the Linux side has an SSD and the
performance difference speaks for itself.

  
So I bought another SSD that's about half the size of the Linux install. I
will try two approaches:

1. Using the "Recovery Drive" Process 
2. Using the "Fresh Install" Procedure
3. Using a brutal "Lol dd go brrrr" Procedure in Linux

The second procedure is solid and I won't even bother to discuss it, but I was curious
to try the recovery drive and to share my experience. I'm discouraged from
taking this path because I've already installed things and set up Windows 10
to my preference. I could repeat it, but I wanted to explore the other options
today.



My HDD is large and originally intended for holding data and being part of swap. My shiny new SDD
is 1TB and the original install has a footprint a little over 2Tb. I expect
the route to fail because the target disk is smaller than the originating
disk! However, the total space used by the Windows install is a mere 159Gb, so
it should have room. But let's see what happens anyway...




The third procedure is out because resizing the disk to be smaller before
transferring it could do something weird in windows. Iunno, I'm just not sure
I want to risk bricking the original drive, then migrating a broken thing.


##Oops

I started by creating a partition on my master
backup external drive and, well, then it formatted the entire drive rather than the partition I thought it would work on. 

This isn't *too* big of a loss since it's mostly filled with old snapshots of things that are
otherwise partially backed up by other means (Dropbox for data, Github for code, older snapshots on another disk, etc). The biggest headache is that I inadvertently lost a dying disk's data. I might cover recovery from frail hardware in a future post since I will have to repeat that now that I have lost the contents. 

As a way to address this all not working due to the possibility that a smaller
target is a no-go, I have a small flash drive with Win10 on it that
should work to install it to the new SSD, and then I can just mount the old C:
directory.

# Recovery Disk

Like I said, commit an entire disk for this, not just a bit partition. I hit
Windows and searched for "recovery drive" and went through the wizard. Before
this I deleted or otherwise migrated data I did not need from C: to another
location, and ran the defragmentation utility.

# Installation Attempt 1:

I don't want to go full Amelia Bedilia on any more disks today, especially now that my main backup
disk has been steamrolled by the Recovery Drive utility.

So, the Linux SSD (2Tb), the data disk (4Tb), and the old Windows disk (4Tb)
should be physically disconnected during the install with either Windows-centric reinstall method. I'll also
take a moment to upgrade the labeling.

# Too Smol

[Too Smol][1]

Ok it looks like I was right. The destination drive was too large. Let's do
the fresh install route

# Fresh Install

So the fresh install is very zippy thanks to the new SSD.

I remember from the previous time that the install would prefer the Legacy mode and override the UEFI settings to
make that happen. I will have to do a conversion from Legacy to UEFI mode if this happened again.

I also remember having to repeatedly refuse the Microsoft login to force the
local user issue (NO I will NOT create a M$ account and use it! Nope!).
Fortunately, because of the unusual broadcom driver I have on this machine, I
don't have internet is the truth when going through the install. Continuing
with "limited" setup takes me to the local user creation. I enter my name and
proceed. I should have all this in the HDD's Downloads folder if it didn't
already get migrated.

## Convert to GPT

Alright let's peek at the disks; disk 0 is the Windows OS Disk:

    diskpart
    list disk

Under "Gpt" there is not an asterisk. Ok, so make sure external disks are
unplugged and so run:

    mbr2gpt /convert /allowfullOS

Using Diskpart again, I see a mark for GPT. Nice. Let's reboot, and change up
the BIOS to be UEFI mode again.


After a reboot, my Linux install is ok, I can see the other GPT Windows boot
location. 

# Migration of data from HDD to SDD

There are a few options for this:

1. In new install, copy stuff over from old one and re-run installers,
   drivers, etc.
2. Use system restore in some clever way?
3. Use a brute force copy of all files (might not work well with programs,
   registry entries, etc)

I think I want to try the brute copy, using Linux. If it goes badly I'll have
the good source and I can re-try.

## Clonezilla

I used Clonezilla's         part_to_local_part
function to clone my shrunken old Windows partition to the new Windows
partition on the SSD.

[Clonezilla Screenshot][2]


So, after this and a large sync operation, I do the reboot of fate. 

## Post-reboot:

Let's see what works or not. After rebooting from the new disk with a copy of
the old data, the screen
goes black. This is not good...

After waiting for a few minutes, I see some graphical elements like a mouse cursor. I'm not sure
what's going on at this point. I see a flicker of the accent color of the old
machine but it's not working.

I boot from the old install and its ok. After shrinking maybe I can create a recovery
disk that will work this time around? Alternatively, I need to copy the first
partition as well with clonezilla. In the old Windows 10 install, using Disk
Management I see that the System Reserved portion is the same on both the old
and new disks. So, after I create a new recovery drive, I will try to clone
the first partition. 


I get the same black screen after using clone.

## Reset this PC

Trying a keep-files cloud download re-install of Windows 10... but unable to
download because ... DRIVER!

OMG. I have to get into the command line to run the Broadcom installer. I
won't bother with this. I'll try to use the flash drive again to do an
in-place reinstall. That is, using "Keep my files" and see what happens with
that. Nope that's only if Windows has booted. Let's try repair with command
line.

Ok, I found the driver installer under my old install just fine, but I cannot run it due to a compatibility
issue. Amazing.

I restart again and get into safe mode after getting to that option. I first get: sihost.exe - System Warning "Unknown Hard Error",
but I seem to get in? I try to spin up explorer.exe but the screen is
flickering. I escape it with         shutdown /r /t 0

I don't think safe mode will be much of an answer.

It's seriously weird behavior, but I did just clone things in a direct way. I wonder if I can improve things if I remove the other
disk *which is cloned*. So I reboot with that disk literally not connected on
SATA. I bet it will still be hosed. At this rate I'm sure I'm going to have
to do a clean installation again. 
Now it cycles forever. I bet its pointing to the old disk and since it can't
find it, it doesn't limp to the login screen.

After reading around I found [This
post](https://www.tenforums.com/installation-upgrade/52837-moving-recreating-efi-partition.html)
covering usage of bcdboot. I tried it, but the new EFI was not functional.

# Giving up -- Fresh Install

I went to bed, and the next morning I decided to do a fresh install and then
migrate things over. I used the flash drive to install windows and now I'm
watching it all come alive. Sadly, I'll need to reinstall a lot of stuff that
I'd accumulated over time:

Music software
* Reason -- incl. disk-free patch
* FL Studio
* Ableton
* Paulstretch

School software
* WSL with Ubuntu
* Arduino
* Altium
* Mathematica
* Octave under WSL
* Matlab
* ADS/Empro
* Remcom EDS
* FEKO
* etc.

So thankfully I moved a bunch of these installers over to another location, so
that will speed some things up. A bunch of drivers should be in there too.

I then used Powershell (as admin) to enable WSL:         Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux

I then went and copied drivers. I skipped the pre-existing files.

# Final thoughts:

I still don't like Windows...

[Life be like][3]

[1]: https://i.imgur.com/z6UsChl.jpeg
[2]: https://i.imgur.com/JxjuRnD.jpeg
[3]: https://i.imgur.com/XdKViCp.mp4
