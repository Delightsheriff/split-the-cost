"""Writes scene.rml. The Moodling bodies and the confetti burst are computed, so
the markup is generated rather than written by hand. Run: python3 generate.py"""

import math
from pathlib import Path

INK = "FF0E0E10"
LOOK = {  # matches src/ui/Moodling.tsx
    "owed": ("FF13EC5B", 8, 0.1),
    "settled": ("FFFFD400", 5, 0.035),
    "owes": ("FFFF5A36", 14, 0.06),
}
CONFETTI = ["FF2F80FF", "FFFFD400", "FFFF6FAE", "FF8B5CF6", "FFFF8A00", "FF0E0E10", "FF00C2D1", "FFFF5A36"]


class Ids:
    def __init__(self):
        self.n = 100

    def __call__(self):
        self.n += 1
        return f"0:{self.n}"


new_id = Ids()


def f(v):
    return f"{v:.4f}".rstrip("0").rstrip(".") if isinstance(v, float) else str(v)


def attrs(**kw):
    return " ".join(f'{k}="{f(v)}"' for k, v in kw.items() if v is not None)


def fill(color):
    return f'<Fill name="Fill"><SolidColor colorValue="{color}" name="Color"/></Fill>'


def stroke(color, thickness, extra=""):
    return f'<Stroke thickness="{f(thickness)}" cap="round" join="round" name="Stroke"><SolidColor colorValue="{color}" name="Color"/>{extra}</Stroke>'


# ---- paths -------------------------------------------------------------------


def polar(rot, dist):
    return math.atan2(rot[1], rot[0]), dist


def quad_vertices(segments, closed):
    """Quadratic segments [(p0, q, p1), ...] as CubicDetachedVertex markup.
    A segment with q=None is a straight line."""
    pts, outs, ins = [], [], []
    for i, (p0, q, p1) in enumerate(segments):
        if i == 0:
            pts.append(p0)
            ins.append(None)
        c1 = None if q is None else (p0[0] + 2 / 3 * (q[0] - p0[0]), p0[1] + 2 / 3 * (q[1] - p0[1]))
        c2 = None if q is None else (p1[0] + 2 / 3 * (q[0] - p1[0]), p1[1] + 2 / 3 * (q[1] - p1[1]))
        outs.append(c1)
        if closed and i == len(segments) - 1:
            ins[0] = c2
        else:
            pts.append(p1)
            ins.append(c2)
    outs += [None] * (len(pts) - len(outs))
    out = []
    for p, hin, hout in zip(pts, ins, outs):
        ir, idist = (0.0, 0.0) if hin is None else polar((hin[0] - p[0], hin[1] - p[1]), math.dist(hin, p))
        orr, odist = (0.0, 0.0) if hout is None else polar((hout[0] - p[0], hout[1] - p[1]), math.dist(hout, p))
        out.append(
            f"<CubicDetachedVertex {attrs(x=float(p[0]), y=float(p[1]), inRotation=ir, inDistance=idist, outRotation=orr, outDistance=odist)}/>"
        )
    return "".join(out)


def blob_vertices(radius, lobes, depth, n=64):
    """The Moodling body: a circle whose radius ripples `lobes` times."""
    r0 = radius / (1 + depth)
    step = 2 * math.pi / n
    out = []
    for i in range(n):
        t = i * step
        r = r0 * (1 + depth * math.cos(lobes * t))
        dr = -r0 * depth * lobes * math.sin(lobes * t)
        dx, dy = dr * math.cos(t) - r * math.sin(t), dr * math.sin(t) + r * math.cos(t)
        out.append(
            f"<CubicMirroredVertex {attrs(x=r * math.cos(t), y=r * math.sin(t), rotation=math.atan2(dy, dx), distance=math.hypot(dx, dy) * step / 3)}/>"
        )
    return "".join(out)


# ---- animation helpers --------------------------------------------------------

EASE = {
    "inout": (0.42, 0, 0.58, 1),
    "out": (0, 0, 0.58, 1),
    "in": (0.42, 0, 1, 1),
    "spring": (0.34, 1.56, 0.64, 1),
}


def keys(prop, frames):
    """frames: [(frame, value, ease)] where ease is a key of EASE, 'linear' or 'hold'."""
    out = [f'<KeyedProperty property="{prop}">']
    for frame, value, ease in frames:
        if ease in EASE:
            x1, y1, x2, y2 = EASE[ease]
            out.append(
                f'<KeyFrameDouble value="{f(float(value))}" frame="{frame}" interpolationType="cubic">'
                f'<CubicEaseInterpolator {attrs(x1=float(x1), y1=float(y1), x2=float(x2), y2=float(y2))}/></KeyFrameDouble>'
            )
        else:
            out.append(f'<KeyFrameDouble value="{f(float(value))}" frame="{frame}" interpolationType="{ease}"/>')
    out.append("</KeyedProperty>")
    return "".join(out)


def keyed(obj, *props):
    return f'<KeyedObject objectId="{obj}">{"".join(props)}</KeyedObject>'


def anim(name, aid, duration, loop, *objects):
    return f'<LinearAnimation loopValue="{loop}" duration="{duration}" name="{name}" id="{aid}">{"".join(objects)}</LinearAnimation>'


def vm_condition(path, bindable, key, literal, op=None):
    opattr = f' opValue="{op}"' if op else ""
    return (
        f"<TransitionViewModelCondition{opattr}><TransitionPropertyViewModelComparator>"
        f'<{bindable}><DataBindContext sourcePathIds="{path}" propertyKey="{key}"/></{bindable}>'
        f"</TransitionPropertyViewModelComparator>{literal}</TransitionViewModelCondition>"
    )


def number_is(path, op, value):
    return vm_condition(path, "BindablePropertyNumber", 636, f'<TransitionValueNumberComparator value="{f(float(value))}"/>', op)


def bool_is(path, value):
    return vm_condition(path, "BindablePropertyBoolean", 634, f'<TransitionValueBooleanComparator value="{str(value).lower()}"/>')


def fired(path):
    return vm_condition(path, "BindablePropertyTrigger", 686, "<TransitionValueTriggerComparator/>")


# ---- Moodling -----------------------------------------------------------------

# One artboard, three moods. A view model drives it:
#   mood  -1 owes, 0 settled, 1 owed
#   look  -1..1, where the face is looking
#   poke  trigger, a squish
#   rich  the seven-tap easter egg's dollar eyes
VM, VM_MOOD, VM_LOOK, VM_POKE, VM_RICH = "0:40", "0:41", "0:42", "0:43", "0:44"
INST = {"Settled": ("0:50", 0), "Owed": ("0:51", 1), "Owes": ("0:52", -1)}
LOOK_MAP = "0:60"

M = {k: new_id() for k in [
    "root", "look", "faces", "rich", "bodies",
    "body_owed", "body_settled", "body_owes",
    "face_owed", "face_settled", "face_owes",
    "eyes_settled", "eyes_owes", "drop",
]}

EYES_Y, MOUTH_Y = -25, 18


def mouth_grin():
    p0, p2, q = (-28, MOUTH_Y - 12), (28, MOUTH_Y - 12), (0, MOUTH_Y + 24)
    return f'<Shape name="Grin"><PointsPath isClosed="true" name="Path">{quad_vertices([(p0, q, p2), (p2, None, p0)], True)}</PointsPath>{fill(INK)}</Shape>'


def face_owed():
    arcs = "".join(
        f'<Shape name="Eye"><PointsPath isClosed="false" name="Path">{quad_vertices([((cx - 14, EYES_Y + 10), (cx, EYES_Y - 12), (cx + 14, EYES_Y + 10))], False)}</PointsPath>{stroke(INK, 8)}</Shape>'
        for cx in (-28, 28)
    )
    return f'<Node opacity="0" name="Face owed" id="{M["face_owed"]}">{arcs}{mouth_grin()}</Node>'


def eyes(node_id, name):
    dots = "".join(
        f'<Shape x="{x}" name="Eye"><Ellipse width="20" height="25" originX="0.5" originY="0.5" name="Path"/>{fill(INK)}</Shape>' for x in (-28, 28)
    )
    return f'<Node y="{EYES_Y}" name="{name}" id="{node_id}">{dots}</Node>'


def face_settled():
    smile = quad_vertices([((-20, MOUTH_Y - 6), (0, MOUTH_Y + 12), (20, MOUTH_Y - 6))], False)
    return (
        f'<Node name="Face settled" id="{M["face_settled"]}">{eyes(M["eyes_settled"], "Eyes settled")}'
        f'<Shape name="Smile"><PointsPath isClosed="false" name="Path">{smile}</PointsPath>{stroke(INK, 7)}</Shape></Node>'
    )


def face_owes():
    y = MOUTH_Y
    wobble = quad_vertices(
        [((-24, y), (-16, y - 10), (-8, y)), ((-8, y), (0, y + 10), (8, y)), ((8, y), (16, y - 10), (24, y))], False
    )
    drop = (
        f'<Node x="58" y="-56" name="Sweat" id="{M["drop"]}">'
        '<Shape x="-5" y="8" name="Shine"><Ellipse width="6" height="6" originX="0.5" originY="0.5" name="Path"/>'
        '<Fill name="Fill"><SolidColor colorValue="B3FFFFFF" name="Color"/></Fill></Shape>'
        '<Shape name="Drop"><PointsPath isClosed="true" name="Path">'
        '<StraightVertex x="0" y="-22"/>'
        '<CubicMirroredVertex x="14" y="6" rotation="1.5708" distance="7.7"/>'
        '<CubicMirroredVertex x="0" y="20" rotation="3.1416" distance="7.7"/>'
        '<CubicMirroredVertex x="-14" y="6" rotation="-1.5708" distance="7.7"/>'
        f"</PointsPath>{fill('FF2F80FF')}</Shape></Node>"
    )
    # Nervous eyes glance to the side.
    return (
        f'<Node opacity="0" name="Face owes" id="{M["face_owes"]}">{drop}'
        f'<Node x="10" name="Glance">{eyes(M["eyes_owes"], "Eyes owes")}</Node>'
        f'<Shape name="Wobble"><PointsPath isClosed="false" name="Path">{wobble}</PointsPath>{stroke(INK, 7)}</Shape></Node>'
    )


def face_rich():
    return (
        f'<Node opacity="0" name="Rich" id="{M["rich"]}">'
        f'<Text x="0" y="{EYES_Y}" sizingValue="autoWidth" originX="0.5" originY="0.5" name="Dollars">'
        f'<TextStylePaint fontSize="46" fontAssetId="0:30" name="Bold" id="0:31">{fill(INK)}</TextStylePaint>'
        '<TextValueRun styleId="0:31" text="$  $" name="Run"/></Text>'
        f"{mouth_grin()}</Node>"
    )


def body(key, opacity):
    color, lobes, depth = LOOK[key]
    return (
        f'<Shape opacity="{opacity}" name="Body {key}" id="{M["body_" + key]}">'
        f'<PointsPath isClosed="true" name="Path">{blob_vertices(100, lobes, depth)}</PointsPath>{fill("FF" + color[2:])}</Shape>'
    )


def mood_anim(name, aid, duration, loop, mood, *extra):
    shown = lambda k: keys("opacity", [(0, 1 if k == mood else 0, "hold")])
    objs = [keyed(M["body_" + k], shown(k)) for k in LOOK] + [keyed(M["face_" + k], shown(k)) for k in LOOK]
    if mood != "settled":
        objs.append(keyed(M["root"], keys("y", [(0, 120, "hold")])))
    return anim(name, aid, duration, loop, *objs, *extra)


def moodling():
    a = {k: new_id() for k in ["owed", "owes", "settled", "blink", "rest", "squish", "plain", "dollars"]}
    s = {k: new_id() for k in ["owed", "owes", "settled", "blink", "rest", "squish", "plain", "dollars"]}
    mood = f"{VM}-{VM_MOOD}"

    to_owed = number_is(mood, "greaterThanOrEqual", 0.5)
    to_owes = number_is(mood, "lessThanOrEqual", -0.5)
    to_settled = number_is(mood, "greaterThan", -0.5) + number_is(mood, "lessThan", 0.5)

    def go(target, cond, ms=250):
        return f'<StateTransition stateToId="{s[target]}" duration="{ms}">{cond}</StateTransition>'

    shiver = [(0, 0, "hold"), (108, 0, "linear")]
    for i, fr in enumerate(range(112, 140, 5)):
        shiver.append((fr, -0.087 if i % 2 == 0 else 0.087, "linear"))
    shiver.append((142, 0, "hold"))

    machine = f"""
<StateMachine name="Main" id="0:7">
  <StateMachineLayer name="Mood" id="0:8">
    <AnyState x="0" y="-160"/><ExitState x="600" y="-160"/>
    <EntryState x="0" y="0">
      <StateTransition stateToId="{s['owed']}">{to_owed}</StateTransition>
      <StateTransition stateToId="{s['owes']}">{to_owes}</StateTransition>
      <StateTransition stateToId="{s['settled']}"/>
    </EntryState>
    <AnimationState x="300" y="-80" animationId="{a['owed']}" id="{s['owed']}">{go('settled', to_settled)}{go('owes', to_owes)}</AnimationState>
    <AnimationState x="300" y="0" animationId="{a['settled']}" id="{s['settled']}">{go('owed', to_owed)}{go('owes', to_owes)}</AnimationState>
    <AnimationState x="300" y="80" animationId="{a['owes']}" id="{s['owes']}">{go('owed', to_owed)}{go('settled', to_settled)}</AnimationState>
  </StateMachineLayer>
  <StateMachineLayer name="Blink" id="0:9">
    <AnyState x="0" y="-160"/><ExitState x="600" y="-160"/>
    <EntryState x="0" y="0"><StateTransition stateToId="{s['blink']}"/></EntryState>
    <AnimationState x="300" y="0" animationId="{a['blink']}" id="{s['blink']}"/>
  </StateMachineLayer>
  <StateMachineLayer name="Poke" id="0:10">
    <AnyState x="0" y="-160"><StateTransition stateToId="{s['squish']}">{fired(f"{VM}-{VM_POKE}")}</StateTransition></AnyState>
    <ExitState x="600" y="-160"/>
    <EntryState x="0" y="0"><StateTransition stateToId="{s['rest']}"/></EntryState>
    <AnimationState x="300" y="0" animationId="{a['rest']}" id="{s['rest']}"/>
    <AnimationState x="300" y="-80" reset="true" animationId="{a['squish']}" id="{s['squish']}">
      <StateTransition stateToId="{s['rest']}" enableExitTime="true" exitTimeIsPercetange="true" exitTime="100"/>
    </AnimationState>
  </StateMachineLayer>
  <StateMachineLayer name="Rich" id="0:11">
    <AnyState x="0" y="-160"/><ExitState x="600" y="-160"/>
    <EntryState x="0" y="0"><StateTransition stateToId="{s['plain']}"/></EntryState>
    <AnimationState x="300" y="0" animationId="{a['plain']}" id="{s['plain']}">{go('dollars', bool_is(f"{VM}-{VM_RICH}", True), 150)}</AnimationState>
    <AnimationState x="300" y="80" animationId="{a['dollars']}" id="{s['dollars']}">{go('plain', bool_is(f"{VM}-{VM_RICH}", False), 150)}</AnimationState>
  </StateMachineLayer>
</StateMachine>"""

    animations = [
        mood_anim("Owed", a["owed"], 1440, "loop", "owed",
                  keyed(M["body_owed"], keys("rotation", [(0, 0, "linear"), (1440, 2 * math.pi, "linear")]))),
        mood_anim("Settled", a["settled"], 144, "pingPong", "settled",
                  keyed(M["root"], keys("y", [(0, 120, "inout"), (144, 115, "inout")]))),
        mood_anim("Owes", a["owes"], 142, "loop", "owes",
                  keyed(M["body_owes"], keys("rotation", shiver)),
                  keyed(M["drop"], keys("y", [(0, -56, "inout"), (71, -50, "inout"), (142, -56, "inout")]))),
        # Blink every few seconds; nervous eyes blink twice as often.
        anim("Blink", a["blink"], 222, "loop",
             keyed(M["eyes_settled"], keys("scaleY", [(0, 1, "hold"), (208, 1, "linear"), (212, 0.1, "linear"), (219, 1, "hold")])),
             keyed(M["eyes_owes"], keys("scaleY", [(0, 1, "hold"), (97, 1, "linear"), (101, 0.1, "linear"), (108, 1, "hold"),
                                                   (208, 1, "linear"), (212, 0.1, "linear"), (219, 1, "hold")]))),
        anim("Rest", a["rest"], 1, "oneShot",
             keyed(M["root"], keys("scaleX", [(0, 1, "hold")]), keys("scaleY", [(0, 1, "hold")]))),
        anim("Squish", a["squish"], 28, "oneShot",
             keyed(M["root"],
                   keys("scaleX", [(0, 1, "out"), (5, 1.12, "inout"), (12, 0.94, "inout"), (19, 1.03, "inout"), (28, 1, "hold")]),
                   keys("scaleY", [(0, 1, "out"), (5, 0.88, "inout"), (12, 1.06, "inout"), (19, 0.97, "inout"), (28, 1, "hold")]))),
        anim("Plain", a["plain"], 1, "oneShot",
             keyed(M["faces"], keys("opacity", [(0, 1, "hold")])), keyed(M["rich"], keys("opacity", [(0, 0, "hold")]))),
        anim("Dollars", a["dollars"], 1, "oneShot",
             keyed(M["faces"], keys("opacity", [(0, 0, "hold")])), keyed(M["rich"], keys("opacity", [(0, 1, "hold")]))),
    ]

    # First declared paints on top: faces over bodies.
    return f"""
<Artboard defaultStateMachineId="0:7" viewModelId="{VM}" viewModelInstanceId="{INST['Settled'][0]}" styleId="0:5" width="240" height="240" name="Moodling" id="0:2">
  <LayoutComponentStyle name="Artboard Style" id="0:5"/>
  <Node x="120" y="120" name="Root" id="{M['root']}">
    <Node name="Look" id="{M['look']}">
      <DataBindContext sourcePathIds="{VM}-{VM_LOOK}" propertyKey="13" converterId="{LOOK_MAP}"/>
      {face_rich()}
      <Node name="Faces" id="{M['faces']}">{face_owed()}{face_settled()}{face_owes()}</Node>
    </Node>
    <Node name="Bodies" id="{M['bodies']}">{body('owed', 0)}{body('settled', 1)}{body('owes', 0)}</Node>
  </Node>
  {machine}
  {''.join(animations)}
</Artboard>"""


def moodling_data():
    instances = "".join(
        f'<ViewModelInstance exports="true" name="{name}" id="{iid}">'
        f'<ViewModelInstanceNumber propertyValue="{mood}" viewModelPropertyId="{VM_MOOD}"/>'
        f'<ViewModelInstanceNumber propertyValue="0" viewModelPropertyId="{VM_LOOK}"/>'
        f'<ViewModelInstanceTrigger viewModelPropertyId="{VM_POKE}"/>'
        f'<ViewModelInstanceBoolean propertyValue="false" viewModelPropertyId="{VM_RICH}"/>'
        "</ViewModelInstance>"
        for name, (iid, mood) in INST.items()
    )
    return f"""
<DataConverterRangeMapper minInput="-1" maxInput="1" minOutput="-12" maxOutput="12" clampLower="true" clampUpper="true" name="LookToX" id="{LOOK_MAP}"/>
<ViewModel defaultInstanceId="{INST['Settled'][0]}" name="Moodling" id="{VM}">
  <ViewModelPropertyNumber name="mood" id="{VM_MOOD}"/>
  <ViewModelPropertyNumber name="look" id="{VM_LOOK}"/>
  <ViewModelPropertyTrigger name="poke" id="{VM_POKE}"/>
  <ViewModelPropertyBoolean name="rich" id="{VM_RICH}"/>
  {instances}
</ViewModel>"""


# ---- Success ------------------------------------------------------------------


def success():
    badge, ring, check, burst = new_id(), new_id(), new_id(), new_id()
    c = 160
    pieces, piece_keys = [], []
    count = 30
    for i in range(count):
        # Deterministic scatter so the burst looks the same every build.
        r = lambda n: (math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1
        pid = new_id()
        angle = i / count * 2 * math.pi + (r(1) - 0.5) * 0.4
        dist = 60 + r(2) * 100
        color = CONFETTI[i % len(CONFETTI)]
        shape = (
            '<Ellipse width="13" height="13" originX="0.5" originY="0.5" name="Path"/>'
            if r(3) > 0.55
            else '<Rectangle width="18" height="8" cornerRadiusTL="3" originX="0.5" originY="0.5" name="Path"/>'
        )
        pieces.append(f'<Shape x="{c}" y="{c}" scaleX="0" scaleY="0" name="Piece" id="{pid}">{shape}{fill(color)}</Shape>')
        start = 6 + int(r(4) * 6)
        land = start + 26
        tx, ty = c + math.cos(angle) * dist, c + math.sin(angle) * dist
        spin = (r(5) - 0.5) * 8
        piece_keys.append(keyed(
            pid,
            keys("x", [(start, c, "out"), (land, tx, "linear"), (90, tx + (r(6) - 0.5) * 12, "hold")]),
            keys("y", [(start, c, "out"), (land, ty, "in"), (90, ty + 26, "hold")]),
            keys("scaleX", [(start, 0, "out"), (start + 5, 1, "hold")]),
            keys("scaleY", [(start, 0, "out"), (start + 5, 1, "hold")]),
            keys("rotation", [(start, 0, "out"), (90, spin, "hold")]),
            keys("opacity", [(0, 1, "hold"), (64, 1, "linear"), (90, 0, "hold")]),
        ))

    machine = f"""
<StateMachine name="Main" id="0:207">
  <StateMachineLayer name="Layer 1" id="0:208">
    <AnyState x="0" y="-160"/><ExitState x="600" y="-160"/>
    <EntryState x="0" y="0"><StateTransition stateToId="0:209"/></EntryState>
    <AnimationState x="300" y="0" animationId="{burst}" id="0:209"/>
  </StateMachineLayer>
</StateMachine>"""

    animation = anim(
        "Burst", burst, 90, "oneShot",
        keyed(badge,
              keys("scaleX", [(0, 0, "out"), (12, 1.12, "inout"), (19, 0.96, "inout"), (26, 1, "hold")]),
              keys("scaleY", [(0, 0, "out"), (12, 1.12, "inout"), (19, 0.96, "inout"), (26, 1, "hold")])),
        keyed(check, keys("end", [(0, 0, "hold"), (12, 0, "out"), (30, 1, "hold")])),
        keyed(ring,
              keys("scaleX", [(0, 1, "hold"), (10, 1, "out"), (42, 1.9, "hold")]),
              keys("scaleY", [(0, 1, "hold"), (10, 1, "out"), (42, 1.9, "hold")]),
              keys("opacity", [(0, 0, "hold"), (10, 0.45, "linear"), (42, 0, "hold")])),
        *piece_keys,
    )

    return f"""
<Artboard x="320" y="0" defaultStateMachineId="0:207" styleId="0:205" width="320" height="320" name="Success" id="0:202">
  <LayoutComponentStyle name="Artboard Style" id="0:205"/>
  <Node x="{c}" y="{c}" scaleX="0" scaleY="0" name="Badge" id="{badge}">
    <Shape name="Check">
      <PointsPath isClosed="false" name="Path">
        <StraightVertex x="-25" y="1"/><StraightVertex x="-8" y="18"/><StraightVertex x="26" y="-17"/>
      </PointsPath>
      {stroke("FF13EC5B", 11, f'<TrimPath start="0" end="0" name="Draw" id="{check}"/>')}
    </Shape>
    <Shape name="Disc"><Ellipse width="112" height="112" originX="0.5" originY="0.5" name="Path"/>{fill(INK)}</Shape>
  </Node>
  <Shape x="{c}" y="{c}" opacity="0" name="Ring" id="{ring}">
    <Ellipse width="112" height="112" originX="0.5" originY="0.5" name="Path"/>{stroke(INK, 4)}
  </Shape>
  {''.join(pieces)}
  {machine}
  {animation}
</Artboard>"""


scene = f"""<Rive version="1" kind="fragment">
{moodling()}
{success()}
<FontAsset file="Manrope-Bold.ttf" name="Manrope Bold" id="0:30"/>
{moodling_data()}
</Rive>
"""

Path(__file__).with_name("scene.rml").write_text(scene)
print("wrote scene.rml")
