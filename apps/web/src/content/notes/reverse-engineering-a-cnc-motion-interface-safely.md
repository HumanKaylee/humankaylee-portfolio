---
title: "Reverse-engineering a CNC motion interface without moving the machine"
slug: "reverse-engineering-a-cnc-motion-interface-safely"
summary: "A safety-first method for turning captured CNC traffic into a falsifiable C++20 interface model before any Linux driver can touch hardware."
tags:
  - "C++20"
  - "Linux"
  - "reverse engineering"
publishedAt: "2026-08-27"
publicationStatus: "publish"
seo:
  title: "Reverse-engineering a CNC motion interface safely"
  description: "How capture-backed validation can turn an undocumented CNC interface into testable C++20 code before a Linux driver reaches hardware."
  canonicalPath: "/notes/reverse-engineering-a-cnc-motion-interface-safely/"
  ogImage: "/social/openxhc-linuxcnc.png"
---

The first useful milestone was not machine motion. It was a software boundary
that made the current understanding of the controller falsifiable without
giving that software any way to reach the controller.

That distinction matters for physical systems. A parser that appears correct in
a synthetic round trip can still share the same wrong assumptions as its
encoder. A live test can reveal those assumptions, but it can also turn an
incomplete model into unintended motion. OpenXHC uses captured evidence to get
the stronger test while preserving the safer development loop.

## Start with an offline artifact

The first deliverable is a fixed-capacity C++20 codec and validator. It does not
open the device, send reports, plan trajectories, or command axes. Its inputs
are owner-authorized captures retained outside the public site.

This makes the failure modes ordinary software failures. The validator can
reject an unexpected record, report a reconstruction mismatch, or show that a
decoded coordinate disagrees with an observed machine position. None of those
failures can move the machine.

## Prefer evidence that can reject the model

An encoder and decoder can agree with each other while both are wrong. The more
useful check starts with traffic created by the real system, outside the code
under test. The validator decodes that evidence, re-encodes it, and requires the
entire captured report to match byte for byte.

Across the retained validation set, 2,490 reports from 14 motion bursts
reconstructed with zero mismatches. Decoded machine coordinates agreed with the
controller display within 0.0005 mm. Those aggregate results are safe to share;
the underlying records, commands, field map, private paths, and device access
details are not.

## Keep the future boundary visible

The validated codec is a foundation for a Linux-native integration, not a
finished machine-control driver. USB transport, trajectory planning, safety
supervision, and LinuxCNC HAL integration remain separate future stages. Each
stage needs its own evidence and decision gate before the next one can reach
physical hardware.

That boundary is useful beyond CNC work. When software touches a physical
system, split observation, interpretation, transport, planning, and actuation.
Then ask what evidence can disprove each layer before granting it more
authority.

[Read the OpenXHC case study](/work/openxhc-linuxcnc/) for the system diagram,
measured results, limits, and public-safe proof media.
