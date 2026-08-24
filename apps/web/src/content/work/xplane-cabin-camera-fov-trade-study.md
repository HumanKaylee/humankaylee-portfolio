---
title: "X-Plane Cabin Camera FOV Trade Study"
slug: "xplane-cabin-camera-fov-trade-study"
discipline: "simulation"
year: 2026
placement: "supporting"
featuredOrder: 3
lede: "A documented X-Plane replay compares four cabin camera views at the same flight moments, making the trade between a narrow 50-degree configuration and a wider 110-degree configuration visible frame by frame."
problem: "A narrow cabin-camera field of view preserves angular detail but can lose the horizon, wing, and surrounding context during a bank; a wider view preserves context while spreading the same pixels across more of the scene."
stakes: "A camera configuration chosen from unmatched flights can turn pilot variation into a false lens conclusion, while a configuration that loses orientation references may fail at the moment those references matter most."
role: "Replay-study design, four-camera comparison workflow, artifact review, and publication-safe evidence presentation."
constraints:
  - "Compare matching moments from the documented scripted flight rather than unrelated hand-flown runs."
  - "Keep all four port/starboard forward/aft views visible together so bank asymmetry remains inspectable."
  - "Preserve camera parameters in each frame while removing internal camera designators and private provenance."
architecture:
  overview: "The supplied artifact set documents a scripted X-Plane takeoff, climb, and opposite-direction bank sequence captured from four cabin cameras and composited into a 2x2 inspection frame for each camera configuration."
  diagramAlt: "A documented X-Plane flight sequence feeding four synchronized cabin views into one 2x2 composite, with matching timestamps compared across two camera configurations."
decisions:
  - title: "Compare complete configurations at matching timestamps"
    choice: "Present the 50-degree baseline-pitch configuration against the 110-degree negative-pitch configuration at the documented 120-second and 180-second bank moments."
    alternatives:
      - "Compare unrelated frames or describe horizontal FOV as the only changed parameter."
    tradeoff: "The comparison is honest about the pitch difference, so it demonstrates the supplied configurations without pretending to isolate one variable."
  - title: "Keep four views in one inspection frame"
    choice: "Retain the port-forward, port-aft, starboard-forward, and starboard-aft tiles in one composite."
    alternatives:
      - "Publish one attractive camera view or crop the wide composite into a conventional 16:9 frame."
    tradeoff: "The wide frame is less cinematic, but it preserves the asymmetry and evidence needed to evaluate a bank."
  - title: "Publish sanitized captured evidence"
    choice: "Mask internal camera tokens and omit private manifests while preserving the real X-Plane pixels and generic camera parameters."
    alternatives:
      - "Publish raw artifacts or recreate the study with invented imagery."
    tradeoff: "The public artifact loses internal provenance labels but remains visually faithful and safer to share."
outcome: "At both supplied bank timestamps, the narrow configuration loses more wing or horizon context while the wider configuration retains more surrounding references; the result is a bounded visual trade study rather than a universal camera-selection rule."
lessons:
  - "Matched flight moments are essential because pilot or geometry variation can overwhelm a camera comparison."
  - "A four-view composite exposes bank asymmetry that a single showcase frame would hide."
  - "Evidence remains useful after redaction when generic camera identity and numeric parameters stay visible."
evidence:
  label: "Two documented camera configurations"
  summary: "Two 250-second, four-camera composites and two matched bank comparisons show the 50-degree baseline-pitch configuration and the 110-degree negative-pitch configuration at the same documented flight moments."
  values:
    - label: "Configurations"
      value: "2 compared"
      detail: "The supplied archive contains a 50-degree baseline-pitch configuration and a 110-degree configuration with a negative 5-degree pitch offset."
    - label: "Camera views"
      value: "4 synchronized"
      detail: "Port forward, port aft, starboard forward, and starboard aft remain visible in every composite."
    - label: "Inspection points"
      value: "120 s and 180 s"
      detail: "The published stills compare the documented opposite-direction bank phases."
  scope: "The public media is a sanitized derivative of a user-supplied X-Plane artifact archive. The included manifests describe a scripted replay, but the replay harness source was not supplied or independently rerun."
  limits: "This evidence does not establish physical camera performance, lens distortion, detection performance, operator performance, flight-test results, certification suitability, or that horizontal FOV was the only changed parameter."
media:
  kind: "image"
  src: "/media/xplane-fov/comparison-bank-120-1440.webp"
  width: 1440
  height: 800
  alt: "Stacked four-camera X-Plane composites comparing the 50-degree and 110-degree camera configurations during the same documented bank phase."
  caption: "The 50-degree configuration is above the 110-degree configuration at the documented 120-second bank moment."
evidenceMedia:
  - kind: "image"
    src: "/media/xplane-fov/comparison-bank-120-1440.webp"
    responsiveSources:
      - { src: "/media/xplane-fov/comparison-bank-120-640.webp", width: 640 }
      - { src: "/media/xplane-fov/comparison-bank-120-960.webp", width: 960 }
      - { src: "/media/xplane-fov/comparison-bank-120-1440.webp", width: 1440 }
    width: 1440
    height: 800
    alt: "Stacked 50-degree and 110-degree four-camera composites at the documented 120-second bank point."
    caption: "First bank comparison: narrow configuration above, wider negative-pitch configuration below."
  - kind: "image"
    src: "/media/xplane-fov/comparison-bank-180-1440.webp"
    responsiveSources:
      - { src: "/media/xplane-fov/comparison-bank-180-640.webp", width: 640 }
      - { src: "/media/xplane-fov/comparison-bank-180-960.webp", width: 960 }
      - { src: "/media/xplane-fov/comparison-bank-180-1440.webp", width: 1440 }
    width: 1440
    height: 800
    alt: "Stacked 50-degree and 110-degree four-camera composites during the opposite documented bank."
    caption: "Opposite bank comparison at 180 seconds, preserving all four camera views."
  - kind: "video"
    src: "/media/xplane-fov/fov50-p0-h0.mp4"
    poster: "/media/xplane-fov/fov50-p0-h0-poster.webp"
    responsivePosterSources:
      - { src: "/media/xplane-fov/fov50-p0-h0-poster.webp", width: 1440 }
    width: 1440
    height: 400
    alt: "Full 250-second four-camera X-Plane composite for the 50-degree baseline-pitch configuration."
    caption: "50-degree horizontal FOV at baseline pitch, encoded at two frames per second for inspection."
  - kind: "video"
    src: "/media/xplane-fov/fov110-m5-h0.mp4"
    poster: "/media/xplane-fov/fov110-m5-h0-poster.webp"
    responsivePosterSources:
      - { src: "/media/xplane-fov/fov110-m5-h0-poster.webp", width: 1440 }
    width: 1440
    height: 400
    alt: "Full 250-second four-camera X-Plane composite for the 110-degree negative-pitch configuration."
    caption: "110-degree horizontal FOV with a negative 5-degree pitch offset, encoded at two frames per second for inspection."
publicationStatus: "publish"
redactionStatus: "approved"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "operator"
  reviewedOn: "2026-08-24"
  checklistStatus: "complete"
  openItems: []
  notes: "Joe supplied the archive and approved publication. Public derivatives remove the program name, private source paths, and internal camera tokens while preserving generic camera labels and numeric parameters."
  checklist:
    secretsRemoved: "yes"
    hostnamesAndAccessPathsGeneralized: "yes"
    userAndAccountNamesGeneralized: "yes"
    screenshotsInspected: "yes"
    logsSummarizedOrSanitized: "not-applicable"
    publicLinksVerified: "not-applicable"
    claimsHaveSafeEvidence: "yes"
    securitySensitiveProceduresRemoved: "yes"
approvalEvidence:
  humanSignoff:
    reviewer: "Joe Poznanski"
    signedOffOn: "2026-08-24"
    decision: "approved"
    notes: "Joe authorized publication on 2026-08-24 once every release gate passes; this records authorization and does not claim he personally viewed the provider preview."
  artifactInspection:
    source: "Task 2 sanitized X-Plane public artifact set and capture-manifest.json"
    inspectedOn: "2026-08-24"
    result: "passed"
    notes: "Task 2 original resolution inspection covered both comparison images, both posters, representative frames from both videos, and manifest hashes; the sanitized public artifacts passed."
  productionOrPreviewEvidence:
    source: "Cloudflare Pages preview https://1c92ba32.humankaylee-portfolio.pages.dev; deployment 1c92ba32-fb78-435b-a229-7dfeb8592579; source 6df39168df3d1374e9e31058b6b7e160a867bcbc"
    capturedOn: "2026-08-24"
    result: "passed"
    notes: "Agent/browser inspection passed route, header, full-byte hash, direct playback, no-JavaScript, reduced-motion, responsive, privacy, and visual gates. Cloudflare pages.dev direct range and seek are unsupported; exact-byte Chromium Blob seeking proves artifact seekability only. This preview evidence does not claim a public-site release."
seo:
  title: "X-Plane Cabin Camera FOV Trade Study | Joe Poznanski"
  description: "A documented X-Plane replay comparing four cabin camera views across 50-degree and 110-degree configurations at matching flight moments."
  canonicalPath: "/work/xplane-cabin-camera-fov-trade-study/"
  ogImage: "/media/xplane-fov/comparison-bank-120-1440.webp"
---
