---
layout: post
title: "Seize the Means of Communication"
image: '/images/05.jpg'
categories: meshnet,meshtastic,radio,diy,security
---

Following is a presentation I gave recently at [DC720](https://https://dc720.org/) for their March meetup.

[Download the PDF version of the presentation slides:](downloads/Meshnet_Beamer.pdf)

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

The default is:

