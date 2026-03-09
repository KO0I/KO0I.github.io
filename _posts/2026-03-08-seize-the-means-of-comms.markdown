---
layout: post
title: "Seize the Means of Communication"
image: '/images/05.jpg'
categories: meshnet,meshtastic,radio,diy,security
---

Following is a presentation I gave recently at [DC720](https://https://dc720.org/) for their March meetup.

[Download the PDF version of the presentation slides:](download/Meshnet_Beamer.pdf)

# Seize the Means of Communication
**DC720: Meshtastic for Emergency Communications**  
Amber Harrington  
March 6 2026

---

# The Grid is Fragile

Centralized infrastructure concentrates points of failure!

- Most communication infrastructure depends on centralized communication landlords.
- Outages cascade quickly and unpredictably during disasters.
- Even systems with “99.9% uptime” fail during crises of failing underlying infra.
- High congestion or distant environments are not able to use centralized infrastructure.
- Blackouts can completely remove access to means to operate conventional radio equipment or charge cell phones.

**Conclusion:**  
We need fully decentralized communication systems, which are battery powered, able to be charged by solar, and able to be made to go into sleep mode(s) to conserve energy.

---

# The Grid is Watched

Centralized infrastructure enables surveillance!

- Most communication infrastructure depends on centralized providers which the government has abundant access.
- High surveillance and control over centralized networks.
- IMSI from cell phone.
- No need to upload your I.D. to chat on Meshtastic.

**Conclusion:**  
Oh hey same thing: a community needs decentralized communication options and definitely with a minimum of security options.

---

# Peer-to-Peer Networking

## The Basics

“Everyone is a cell tower.”

- Each client node relays messages through the network.
- No central servers.
- A smart phone can connect to the device over Bluetooth.
- No Internet Service Providers required.
- Devices communicate directly node-to-node.

**Result**

- Self-forming network
- Resilient communication

---

# Hardware Overview

Typical components for a Meshtastic network operate in the **900 MHz ISM band**.

Meshtastic devices can be grouped into three broad categories by transmit power (range):

- **Smaller devices** *(Set these to `CLIENT MUTE`)*
- **Larger nodes** *(Set these to `CLIENT` or `CLIENT BASE`)*
- **Secret third option** *(for experienced operators only)*

Examples of specific hardware appear in the appendix **“Demo Gear”**.

---

# Configure Your Node

After setting your general **LoRa region**, set the **Range LoRa Preset**.

The default is: **LongFast 20**

You can leave this if you want to join the public network.

Next set the **Device Role**.

Recommended roles:
CLIENT MUTE → weaker devices in larger networks
CLIENT → relatively strong devices
---

Using the correct role helps the network transmit packets with the **fewest hops**.

Documentation:

- https://meshtastic.org/blog/why-your-mesh-should-switch-from-longfast/#understanding-lora-presets
- https://meshtastic.org/docs/configuration/radio/device/#role-comparison

---

# Why Would Anyone Bother With This? Example 1

## RAVES

- Activate location settings to rally easy.
- Campgrounds / dancefloors remote from cell towers.
- Crowds can swamp towers that may be reachable.
- Secure comms and create channels.

---

# Why Would Anyone Bother With This? Example 2

## SPECIAL RAVES

- Disable location in advance.
- Venues in cities near cell towers → **Stingrays**.
- Use burner cell or have a mesh device with keyboard (such as a LilyGo).
- Leave your real phone at home.

**Operational advice**

- Coordinate settings with friends beforehand.
- Do not allow network changes once headed to the special rave.

---

# Why Would Anyone Bother With This? Example 3

## HIKING

- Enable location.
- Maybe upgrade your antenna.
- Campgrounds and wilderness remote from cell towers.
- Max out range settings.

---

# Configure Your Node – Common Use Cases

Preconfigured channel setups:

- **Default Meshtastic** – Standard `LongFast`
- **MtnMesh Community** – `MediumFast` with slot 20
- **Emergency / SAR** – Maximum range configuration
- **Urban High-Density** – `ShortFast`
- **Private Group** – Custom encrypted channels
- **Long Range** – Maximum distance configuration
- **Repeater / Router** – Infrastructure node setup  


---

# Is There Anything Better Than Meshtastic?

There are multiple meshnet projects.

- **Meshcore** – alternative not covered here.
- **Reticulum** – arguably a more capable approach.

Important:

You **do not need new hardware** to try Reticulum.  
It supports almost the same devices as Meshtastic — only the **software changes**.

More details in the appendix.

---

# Appendix: Reticulum vs Meshtastic (Part 1)

| Feature | Meshnet | Reticulum |
|---|---|---|
| Hardware | hardware limits (e.g., LoRa) | hardware-agnostic (LoRa, Packet Radio, TCP/IP) |
| Security | optional basic encryption | encrypted & authenticated by default |
| Routing | flooding or simple routing | self-configuring delay-tolerant routing |
| Flexibility | limited protocols | unified network across any medium |

---

# Appendix: Reticulum vs Meshtastic (Part 2)

Traditional LoRa mesh networks have structural issues:

- **Flat network** → mainly text, MQTT (optional), and location data
- **Flood routing** → packet duplication, airtime exhaustion
- **Reliability sweet spot** → performance collapses as node count grows
- **Weak security models** → shared keys or optional encryption
- **Device addressing** → identities tied to hardware
- **Limited delay tolerance** → network fails when paths disappear
- **Bad router placement** → excessive hops and airtime exhaustion

---

# Appendix: Reticulum vs Meshtastic (Part 3)

## What Reticulum Does Differently

- Adaptive routing instead of broadcast flooding.
- Works across **multiple transports**:
  - LoRa
  - packet radio
  - TCP/IP
  - serial
- End-to-end encrypted destinations by default.
- **Delay-tolerant networking** (store-and-forward).
- **Cryptographic identities** independent of hardware.

---

# When to Use Either

## Meshtastic

Best for ad-hoc contexts where information is mostly:

- brief text messages
- optional location data

Examples:

- camping
- protests
- raves
- crowded events where cell infrastructure fails

## Reticulum (RNS)

Best for building a **long-term alternet** that keeps working even if:

- cell towers fail
- the Internet becomes inaccessible

Advantages:

- scalable
- stronger security model
- suitable for long-term networks

---

# Appendix: Demo Gear

Example hardware:

- **KeepTeen D5L Meshcore Repeater**  
  Solar panel system with Heltec ESP32 V3 LoRa modules and battery controller

- **Sensecap Solar Node P1-Pro**  
  Outdoor solar-powered Meshtastic node

- **LILYGO T-Deck**  
  Handheld terminal with ESP32, screen, and keyboard

- **T-1000E**  
  Portable tracker and node for Meshtastic networks

- **Lecrow ThinkNode M5**  
  LoRa transceiver with GPS and e-paper display

---

# Bibliography & Notes

## Sources

- Reticulum Network Stack  
- Meshtastic Project  
- *“Gadgets For People Who Don’t Trust The Government”* — Benn Jordan

Video:

https://youtu.be/W_F4rEaRduk?t=178

Documentation:

- https://reticulum.network/index.html
- https://meshtastic.org/

---

## Note: Please Consider Using Less AI

LLM tools should **assist with thoughtless tasks**, not replace thinking.

Maintaining independent reasoning will always be valuable.

