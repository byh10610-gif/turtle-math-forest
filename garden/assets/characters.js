/* GardenArt — original code-native, articulated SVG artwork.
 * API: GardenArt.turtle(prefix), .ladybug(), .butterfly(), .fish(), .flower(),
 * .mushroom(), .clover(), .tree(), .firefly(), .dragonfly(), .snail(), .lotus().
 * Supply a unique prefix per DOM instance. Parent states: .is-walking,
 * .is-happy, .is-sleeping, .is-flying. Mirror the outer wrapper for direction.
 * The turtle is drawn facing right; its ground is y=183 in a 240×200 viewBox.
 * All artwork is decorative; interactive hosts must provide accessible names.
 */
(function () {
  'use strict';
  let serial = 0;
  const id = prefix => `ga-${String(prefix || `art-${++serial}`).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const wrap = (kind, body, viewBox = '0 0 160 160') => `<svg class="garden-art art-${kind}" xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" aria-hidden="true" focusable="false">${body}</svg>`;
  const shadow = (cx = 80, cy = 143, rx = 43, ry = 7) => `<ellipse class="art-ground-shadow" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#385c45" opacity=".13"/>`;
  function turtle(prefix) {
    const p = id(prefix);
    return wrap('turtle', `
      <defs>
        <linearGradient id="${p}-skin" x1=".18" y1="0" x2=".83" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#d4e9a2"/><stop offset=".5" stop-color="#a9cf83"/><stop offset="1" stop-color="#79ad71"/></linearGradient>
        <radialGradient id="${p}-face" cx=".3" cy=".24" r=".9"><stop stop-color="#e3efb2"/><stop offset=".56" stop-color="#bddc95"/><stop offset="1" stop-color="#86b777"/></radialGradient>
        <linearGradient id="${p}-shell" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#7db98f"/><stop offset=".5" stop-color="#528d74"/><stop offset="1" stop-color="#346f5e"/></linearGradient>
        <linearGradient id="${p}-plate" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a0cfa1"/><stop offset="1" stop-color="#669f7c"/></linearGradient>
        <linearGradient id="${p}-rim" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f6dfa6"/><stop offset="1" stop-color="#d2b477"/></linearGradient>
        <radialGradient id="${p}-eye" cx=".35" cy=".24" r=".86"><stop stop-color="#5c4538"/><stop offset="1" stop-color="#282d27"/></radialGradient>
      </defs>
      ${shadow(119, 182, 85, 9)}
      <g class="turtle-rig">
        <path d="M42 133 Q20 129 24 144 Q33 153 48 148" fill="#8bb875" stroke="#75a56c" stroke-width="1.5"/>
        <g class="turtle-leg-back-far"><path d="M70 137 C58 141 50 160 57 169 C64 178 83 173 85 163 L91 145" fill="#80af70"/><path d="M63 167l1-5m8 7 1-5" stroke="#6d9d65" stroke-width="2.5" stroke-linecap="round"/></g>
        <g class="turtle-leg-front-far"><path d="M136 137 C129 146 131 164 141 169 C153 175 168 168 166 159 L161 141" fill="#80af70"/><path d="M145 166v-5m9 5v-5" stroke="#6d9d65" stroke-width="2.5" stroke-linecap="round"/></g>
        <path d="M42 123 C40 149 66 165 111 163 C150 161 165 141 157 123" fill="url(#${p}-rim)"/>
        <path d="M57 148 Q107 169 148 143" fill="none" stroke="#bd9a68" stroke-width="2" opacity=".55"/>
        <g class="turtle-leg-back"><path d="M61 137 C51 145 47 163 51 174 C55 184 75 186 85 177 C91 171 92 151 88 141" fill="url(#${p}-skin)"/><path d="M58 178l.5-6m10 8 .3-7m10 5-.7-6" stroke="#7ca56c" stroke-width="2.8" stroke-linecap="round" opacity=".65"/></g>
        <g class="turtle-leg-front"><path d="M125 138 C119 148 117 169 125 177 C132 185 153 185 160 177 C166 170 161 147 151 137" fill="url(#${p}-skin)"/><path d="M132 179v-6m10 7v-7m10 5-1-6" stroke="#7ca56c" stroke-width="2.8" stroke-linecap="round" opacity=".65"/></g>
        <g class="turtle-shell">
          <path d="M38 132 C33 94 45 55 85 47 C129 37 157 75 162 124 C158 144 130 155 96 152 C67 152 45 145 38 132Z" fill="url(#${p}-rim)"/>
          <path d="M43 125 C40 87 54 58 86 52 C121 46 149 78 156 122 C147 141 119 146 94 143 C71 143 51 137 43 125Z" fill="url(#${p}-shell)"/>
          <path d="M80 79 Q96 68 111 79 L123 104 Q115 120 96 125 Q79 119 69 106Z" fill="url(#${p}-plate)" stroke="#b5d2a1" stroke-width="3" stroke-linejoin="round"/>
          <path d="M80 79 Q76 66 81 54M111 79Q123 75 132 79M123 104Q141 103 151 109M96 125Q98 138 96 144M69 106Q51 107 44 116M69 106Q59 90 55 75" fill="none" stroke="#b6d4a5" stroke-width="3" stroke-linecap="round" opacity=".83"/>
          <path d="M55 84 Q61 66 77 62" fill="none" stroke="#e5f1cb" stroke-width="5" stroke-linecap="round" opacity=".42"/>
          <path d="M48 128 Q93 152 146 126" fill="none" stroke="#fce6af" stroke-width="3" stroke-linecap="round" opacity=".6"/>
        </g>
        <g class="turtle-head">
          <path d="M148 140Q157 154 171 146Q186 137 179 121L152 119Z" fill="url(#${p}-skin)"/>
          <path d="M139 99 C135 69 154 48 181 49 C210 47 226 70 225 98 C226 128 204 145 181 144 C153 143 139 128 139 99Z" fill="url(#${p}-face)"/>
          <path d="M151 72 Q159 57 175 57" fill="none" stroke="#f6f8d3" stroke-width="5" stroke-linecap="round" opacity=".48"/>
          <ellipse cx="151" cy="114" rx="10" ry="6.7" fill="#eeb3a4" opacity=".78"/>
          <ellipse cx="212" cy="113" rx="10.5" ry="7" fill="#eeb3a4" opacity=".88"/>
          <g class="turtle-eyes">
            <ellipse cx="164" cy="92" rx="11.2" ry="14.5" fill="#fffaf0"/>
            <ellipse cx="166" cy="93" rx="8.7" ry="12.1" fill="url(#${p}-eye)"/>
            <ellipse cx="202" cy="91" rx="12.4" ry="15.4" fill="#fffaf0"/>
            <ellipse cx="203" cy="92" rx="9.7" ry="12.8" fill="url(#${p}-eye)"/>
            <ellipse cx="163" cy="87.5" rx="3.8" ry="4.9" fill="white"/><circle cx="170" cy="98" r="1.8" fill="#f5ecc8"/>
            <ellipse cx="200" cy="86" rx="4.1" ry="5.2" fill="white"/><circle cx="207" cy="98" r="2" fill="#f5ecc8"/>
          </g>
          <path class="turtle-closed-eyes" d="M155 95q9-9 18 0m20 0q9-9 18 0" fill="none" stroke="#485c3c" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M158 73q6-4 12-1m26-2q7-3 12 2" fill="none" stroke="#779763" stroke-width="2.8" stroke-linecap="round"/>
          <ellipse cx="180" cy="107" rx="1.8" ry="1.4" fill="#718b59"/><ellipse cx="189" cy="106" rx="1.8" ry="1.4" fill="#718b59"/>
          <ellipse class="turtle-chew" cx="186" cy="121" rx="11" ry="7" fill="#79604d"/>
          <path class="turtle-smile" d="M173 118 Q184 130 197 116" fill="none" stroke="#60764d" stroke-width="3" stroke-linecap="round"/>
          <path class="turtle-smile" d="M177 121Q186 128 193 120" fill="#efb29f" opacity=".85"/>
          <g class="turtle-blossom" transform="translate(151 58) rotate(-20)">
            <path d="M0 0Q-17-16-17-3Q-16 7 0 5" fill="#8bbf88"/>
            <path d="M0 0Q4-17 12-9Q19 1 4 6" fill="#73a974"/>
            <g fill="#fff5d5"><ellipse cx="0" cy="-7" rx="4.6" ry="7"/><ellipse cx="7" cy="-2" rx="7" ry="4.6"/><ellipse cx="4" cy="6" rx="4.6" ry="7" transform="rotate(-35 4 6)"/><ellipse cx="-5" cy="6" rx="4.6" ry="7" transform="rotate(35 -5 6)"/><ellipse cx="-7" cy="-2" rx="7" ry="4.6"/></g><circle r="4.5" fill="#e8bb66"/>
          </g>
        </g>
      </g>`, '0 0 240 200');
  }
  function ladybug(prefix) {
    const p = id(prefix);
    return wrap('ladybug', `<defs><radialGradient id="${p}-wing" cx=".3" cy=".2" r="1"><stop stop-color="#f5b0a0"/><stop offset=".45" stop-color="#e97468"/><stop offset="1" stop-color="#c64f52"/></radialGradient></defs>${shadow(80,133,34,6)}
      <g class="ladybug-body"><g stroke="#5c574e" stroke-width="4.5" stroke-linecap="round"><path d="M51 78l-12-7m11 25-15 2m19 12-12 11m66-43 12-7m-11 25 15 2m-19 12 12 11"/></g><ellipse cx="80" cy="93" rx="37" ry="39" fill="#514d44"/>
      <g class="ladybug-wing-left"><path d="M78 56C43 54 33 87 45 112Q56 137 78 130Z" fill="url(#${p}-wing)"/><circle cx="58" cy="78" r="8" fill="#5d514a"/><circle cx="58" cy="108" r="7.5" fill="#5d514a"/><path d="M52 69q-8 8-9 18" stroke="#ffe0d1" stroke-width="4" fill="none" stroke-linecap="round" opacity=".65"/></g>
      <g class="ladybug-wing-right"><path d="M82 56C117 54 127 87 115 112Q104 137 82 130Z" fill="url(#${p}-wing)"/><circle cx="102" cy="78" r="8" fill="#5d514a"/><circle cx="102" cy="108" r="7.5" fill="#5d514a"/></g>
      <path d="M65 48q-14-13-10-19m40 19q14-13 10-19" fill="none" stroke="#5c574e" stroke-width="3.5" stroke-linecap="round"/><circle cx="55" cy="29" r="4" fill="#5c574e"/><circle cx="105" cy="29" r="4" fill="#5c574e"/>
      <ellipse cx="80" cy="56" rx="25" ry="21" fill="#5f5b4e"/><ellipse cx="69" cy="53" rx="5" ry="6.2" fill="#fff7dd"/><ellipse cx="92" cy="53" rx="5" ry="6.2" fill="#fff7dd"/><circle cx="70" cy="54" r="2.5" fill="#413f38"/><circle cx="91" cy="54" r="2.5" fill="#413f38"/><ellipse cx="62" cy="63" rx="5" ry="3" fill="#e8a38e"/><ellipse cx="99" cy="63" rx="5" ry="3" fill="#e8a38e"/><path d="M75 65q5 5 10 0" fill="none" stroke="#e8d9b5" stroke-width="2" stroke-linecap="round"/></g>`);
  }
  function butterfly(prefix) {
    const p = id(prefix);
    return wrap('butterfly', `<defs><radialGradient id="${p}-petal"><stop stop-color="#fff2be"/><stop offset="1" stop-color="#eea592"/></radialGradient></defs>
      <g class="butterfly-wing-left"><path d="M77 78C63 34 26 29 20 52C14 72 35 89 62 93C32 90 28 118 43 126C61 136 75 108 80 91" fill="url(#${p}-petal)" stroke="#d98f85" stroke-width="2.5"/><path d="M66 76Q36 47 31 60Q32 75 62 83M66 102q-18-5-18 8q9 7 18-8" fill="#fff5d5" opacity=".7"/><circle cx="33" cy="63" r="5" fill="#f7cf89"/></g>
      <g class="butterfly-wing-right"><path d="M83 78C97 34 134 29 140 52C146 72 125 89 98 93C128 90 132 118 117 126C99 136 85 108 80 91" fill="url(#${p}-petal)" stroke="#d98f85" stroke-width="2.5"/><path d="M94 76Q124 47 129 60Q128 75 98 83M94 102q18-5 18 8q-9 7-18-8" fill="#fff5d5" opacity=".7"/><circle cx="127" cy="63" r="5" fill="#f7cf89"/></g>
      <path d="M76 61Q66 42 61 46M84 61q10-19 15-15" fill="none" stroke="#7f7864" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="80" cy="88" rx="8" ry="27" fill="#9d9777"/><circle cx="80" cy="65" r="11" fill="#b6b58c"/><circle cx="76" cy="64" r="1.8" fill="#4c5842"/><circle cx="84" cy="64" r="1.8" fill="#4c5842"/><path d="M77 69q3 3 6 0" fill="none" stroke="#68734d" stroke-width="1.5" stroke-linecap="round"/>`);
  }
  function fish(prefix) {
    const p = id(prefix);
    return wrap('fish', `<defs><linearGradient id="${p}-body" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffe7b4"/><stop offset=".5" stop-color="#f5b982"/><stop offset="1" stop-color="#e78c76"/></linearGradient></defs>
      <g class="fish-tail"><path d="M52 80Q22 46 17 58Q22 79 16 103Q24 118 54 86" fill="#eab49c"/><path d="M21 66l24 14-24 16" fill="none" stroke="#fbe0bd" stroke-width="2" opacity=".7"/></g>
      <path d="M64 57Q74 29 94 44L99 59M66 104q21 23 29 6" fill="#e6a083"/>
      <path d="M45 81C53 52 92 43 118 65Q145 86 118 103C90 123 58 109 45 81Z" fill="url(#${p}-body)"/>
      <path class="fish-fin" d="M87 81Q65 73 70 91Q79 99 89 87" fill="#f7d2a6" stroke="#dfaa81" stroke-width="1.5"/>
      <ellipse cx="113" cy="77" rx="6" ry="7" fill="#5f594d"/><circle cx="115" cy="75" r="2.1" fill="#fffaf0"/><ellipse cx="120" cy="91" rx="6" ry="3.7" fill="#e98c81" opacity=".8"/><path d="M128 84q-5 4-8 0" fill="none" stroke="#b57566" stroke-width="2" stroke-linecap="round"/><path d="M66 64q15-8 28-5" fill="none" stroke="#fff5cf" stroke-width="4" stroke-linecap="round" opacity=".7"/>`);
  }
  function flower(prefix) {
    const p = id(prefix);
    return wrap('flower', `<defs><radialGradient id="${p}-petal" cx=".45" cy=".3"><stop stop-color="#fff3eb"/><stop offset="1" stop-color="#edb6af"/></radialGradient></defs>${shadow(80,144,32,5)}
      <path d="M81 139Q85 101 79 66" fill="none" stroke="#73996b" stroke-width="6" stroke-linecap="round"/><path d="M81 114Q56 93 49 110Q52 129 81 122M83 99q22-24 30-8q-2 19-30 18" fill="#a2be7e"/><path d="M80 118l-23-8m28-6 20-9" stroke="#7e9e65" stroke-width="1.5" fill="none"/>
      <g class="flower-head"><g fill="url(#${p}-petal)"><ellipse cx="80" cy="46" rx="15" ry="24"/><ellipse cx="104" cy="62" rx="24" ry="15" transform="rotate(-25 104 62)"/><ellipse cx="97" cy="88" rx="15" ry="24" transform="rotate(-30 97 88)"/><ellipse cx="64" cy="88" rx="15" ry="24" transform="rotate(30 64 88)"/><ellipse cx="55" cy="62" rx="24" ry="15" transform="rotate(25 55 62)"/></g><circle cx="80" cy="70" r="19" fill="#eec781"/><circle cx="75" cy="66" r="2.5" fill="#fce5ac"/><circle cx="87" cy="73" r="2" fill="#d5a85e"/><circle cx="74" cy="78" r="2" fill="#d5a85e"/></g>`);
  }
  function mushroom(prefix) {
    const p = id(prefix);
    return wrap('mushroom', `<defs><linearGradient id="${p}-cap" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#efb19f"/><stop offset="1" stop-color="#ce7e72"/></linearGradient><linearGradient id="${p}-stem" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#e5d5b2"/><stop offset=".5" stop-color="#fff1d4"/><stop offset="1" stop-color="#dfcba4"/></linearGradient></defs>${shadow(78,143,47,6)}
      <path d="M63 83Q66 109 57 134Q58 146 81 146Q105 146 103 134Q92 109 96 83Z" fill="url(#${p}-stem)"/>
      <ellipse cx="79" cy="89" rx="57" ry="17" fill="#eed7b4"/><path d="M24 85C28 47 55 25 80 27C112 27 135 53 138 84Q131 105 80 99Q35 102 24 85Z" fill="url(#${p}-cap)"/>
      <ellipse cx="53" cy="64" rx="11" ry="8" transform="rotate(-26 53 64)" fill="#fff2d7"/><ellipse cx="92" cy="49" rx="9" ry="7" fill="#fff2d7"/><ellipse cx="111" cy="77" rx="12" ry="8" transform="rotate(18 111 77)" fill="#fff2d7"/><circle cx="78" cy="80" r="5" fill="#fff2d7"/><path d="M41 52q12-14 28-16" stroke="#f9d4c0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".65"/><path d="M66 140q12 5 25 0" stroke="#cbb68b" stroke-width="2" fill="none"/>
      <path d="M38 142q-10-14-6-18q10 1 12 17m72 1q4-16 12-18q5 8-6 18" fill="#9dbb80"/>`);
  }
  function clover(prefix) {
    const p = id(prefix);
    return wrap('clover', `<defs><linearGradient id="${p}-leaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bcd59c"/><stop offset="1" stop-color="#6f9f76"/></linearGradient></defs>${shadow(81,142,26,4)}<path d="M79 140Q94 120 82 87" fill="none" stroke="#739b70" stroke-width="5" stroke-linecap="round"/>
      <g fill="url(#${p}-leaf)"><path d="M80 84Q45 64 47 44Q50 27 65 35Q81 20 92 38Q101 58 80 84Z"/><path d="M84 84Q99 45 120 47Q139 51 129 68Q143 84 124 95Q108 100 84 84Z"/><path d="M82 87Q122 101 118 123Q113 138 98 128Q81 141 71 124Q66 108 82 87Z"/><path d="M78 85Q64 123 43 119Q26 115 35 99Q21 83 39 73Q56 66 78 85Z"/></g><g stroke="#d5e5b7" stroke-width="2" opacity=".6" fill="none" stroke-linecap="round"><path d="M79 80L65 47M87 84l33-16M82 92l14 31M73 86l-32 15"/></g><circle cx="81" cy="85" r="6" fill="#79a272"/>`);
  }
  function tree(prefix) {
    const p = id(prefix);
    return wrap('tree', `<defs><linearGradient id="${p}-trunk" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#b99b74"/><stop offset=".45" stop-color="#d5b88c"/><stop offset="1" stop-color="#a68c69"/></linearGradient><radialGradient id="${p}-leaves" cx=".35" cy=".2" r=".9"><stop stop-color="#c9db9d"/><stop offset=".6" stop-color="#97bf86"/><stop offset="1" stop-color="#6e9d79"/></radialGradient></defs>${shadow(110,247,70,10)}
      <path d="M93 233L98 136L80 105l9-8 21 27 24-34 10 7-25 46 7 90Q145 242 127 247Q111 241 92 247Q71 246 93 233Z" fill="url(#${p}-trunk)"/><path d="M105 229l2-62m6-14 2-22m-15 88 2-22" stroke="#a58b68" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
      <g class="tree-canopy" fill="url(#${p}-leaves)"><path d="M50 156C23 158 10 135 22 111C3 91 18 62 42 61C39 34 68 21 87 32C103 8 137 15 146 37C178 24 198 49 188 73C215 83 215 116 197 128C197 154 167 169 146 155C128 171 102 169 87 154C75 169 58 168 50 156Z"/><circle cx="57" cy="94" r="37" opacity=".58"/><circle cx="118" cy="71" r="47" opacity=".72"/><circle cx="167" cy="110" r="34" opacity=".42"/><path d="M45 70q9-15 26-17m35-16q18-5 26 7m23 14q17-5 23 7" fill="none" stroke="#e4edbf" stroke-width="5" stroke-linecap="round" opacity=".45"/>
      <g fill="#f5cfaa"><circle cx="52" cy="121" r="9"/><circle cx="148" cy="88" r="10"/><circle cx="171" cy="130" r="8"/></g><g fill="#fff3cf"><circle cx="51" cy="118" r="2.5"/><circle cx="147" cy="85" r="2.5"/><circle cx="170" cy="127" r="2"/></g></g><g fill="#a4bf83"><path d="M81 245q-12-19-7-28q13 9 15 27m42 2q7-23 17-24q3 16-10 23"/></g>`, '0 0 220 260');
  }
  function firefly(prefix) {
    const p = id(prefix);
    return wrap('firefly', `<defs><radialGradient id="${p}-glow"><stop stop-color="#ffef9b" stop-opacity=".8"/><stop offset=".4" stop-color="#ffe591" stop-opacity=".3"/><stop offset="1" stop-color="#ffe591" stop-opacity="0"/></radialGradient><linearGradient id="${p}-body" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8da389"/><stop offset="1" stop-color="#f8dd83"/></linearGradient></defs><circle class="firefly-glow" cx="80" cy="108" r="45" fill="url(#${p}-glow)"/><g class="tiny-wing-left"><ellipse cx="61" cy="76" rx="14" ry="27" transform="rotate(-44 61 76)" fill="#e8ecd0" fill-opacity=".85" stroke="#cad3b8" stroke-width="1.5"/></g><g class="tiny-wing-right"><ellipse cx="99" cy="76" rx="14" ry="27" transform="rotate(44 99 76)" fill="#e8ecd0" fill-opacity=".85" stroke="#cad3b8" stroke-width="1.5"/></g><ellipse cx="80" cy="94" rx="14" ry="26" fill="url(#${p}-body)"/><ellipse class="firefly-light" cx="80" cy="110" rx="11" ry="11" fill="#fff2ab"/><path d="M74 57L66 44m20 13 8-13" fill="none" stroke="#6c7e67" stroke-width="2.5" stroke-linecap="round"/><circle cx="80" cy="66" r="15" fill="#91aa88"/><circle cx="74" cy="64" r="2.4" fill="#445c43"/><circle cx="86" cy="64" r="2.4" fill="#445c43"/><path d="M76 72q4 4 8 0" fill="none" stroke="#566e50" stroke-width="2" stroke-linecap="round"/>`);
  }
  function dragonfly(prefix) {
    const p = id(prefix);
    return wrap('dragonfly', `<defs><linearGradient id="${p}-wing" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f2f5e5"/><stop offset="1" stop-color="#b6d9d2"/></linearGradient></defs><g class="tiny-wing-left" fill="url(#${p}-wing)" fill-opacity=".85" stroke="#9dbfb8" stroke-width="1.2"><ellipse cx="48" cy="65" rx="32" ry="11" transform="rotate(22 48 65)"/><ellipse cx="50" cy="91" rx="30" ry="10" transform="rotate(-18 50 91)"/></g><g class="tiny-wing-right" fill="url(#${p}-wing)" fill-opacity=".85" stroke="#9dbfb8" stroke-width="1.2"><ellipse cx="112" cy="65" rx="32" ry="11" transform="rotate(-22 112 65)"/><ellipse cx="110" cy="91" rx="30" ry="10" transform="rotate(18 110 91)"/></g><path d="M80 75Q91 96 82 133Q79 141 76 133Q68 97 80 75" fill="#85ada6"/><path d="M74 99h12m-12 10h11m-10 10h10" stroke="#b6d5bf" stroke-width="2.5"/><ellipse cx="80" cy="72" rx="11" ry="18" fill="#9fc1ad"/><ellipse cx="80" cy="53" rx="18" ry="15" fill="#a9c9b1"/><ellipse cx="72" cy="51" rx="5" ry="6" fill="#f7f6de"/><ellipse cx="89" cy="51" rx="5" ry="6" fill="#f7f6de"/><circle cx="73" cy="51" r="2.5" fill="#4f6855"/><circle cx="88" cy="51" r="2.5" fill="#4f6855"/><path d="M76 61q4 3 8 0" fill="none" stroke="#6a8c72" stroke-width="2" stroke-linecap="round"/>`);
  }
  function snail(prefix) {
    const p = id(prefix);
    return wrap('snail', `<defs><radialGradient id="${p}-shell" cx=".3" cy=".3" r=".9"><stop stop-color="#f4d4b7"/><stop offset="1" stop-color="#cf9b85"/></radialGradient><linearGradient id="${p}-body" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d6dfb4"/><stop offset="1" stop-color="#aebd8d"/></linearGradient></defs>${shadow(80,139,55,5)}<path d="M22 128Q37 116 62 119L105 118Q110 99 122 99Q135 99 136 115Q138 133 116 139L38 139Q21 138 22 128" fill="url(#${p}-body)"/><circle cx="66" cy="96" r="35" fill="url(#${p}-shell)"/><path d="M59 125C95 135 110 84 77 70C51 58 29 89 47 109C63 128 89 107 78 92C70 80 56 88 60 99Q65 107 71 101" fill="none" stroke="#b68275" stroke-width="4" stroke-linecap="round" opacity=".7"/><path d="M116 106l-6-25m19 23 10-24" stroke="#a7b48c" stroke-width="5" stroke-linecap="round"/><circle cx="110" cy="80" r="6" fill="#d9e2bc"/><circle cx="139" cy="79" r="6" fill="#d9e2bc"/><circle cx="111" cy="80" r="2.5" fill="#58654b"/><circle cx="140" cy="79" r="2.5" fill="#58654b"/><path d="M122 119q5 4 10-1" fill="none" stroke="#7d8d63" stroke-width="2" stroke-linecap="round"/><ellipse cx="119" cy="113" rx="4" ry="2.5" fill="#dda796"/>`);
  }
  function lotus(prefix) {
    const p = id(prefix);
    return wrap('lotus', `<defs><linearGradient id="${p}-petal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f3c5ce"/><stop offset="1" stop-color="#fff0d9"/></linearGradient><linearGradient id="${p}-leaf" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b3cba0"/><stop offset="1" stop-color="#79a58d"/></linearGradient></defs><ellipse cx="80" cy="119" rx="63" ry="23" fill="#77b6ad" opacity=".12"/><path d="M81 102L68 120C21 132 12 106 37 92C62 76 114 84 128 100C149 123 112 133 88 120Z" fill="url(#${p}-leaf)"/><path d="M42 102l32 8m34-12-27 13m3-19-4 16" fill="none" stroke="#cfe0b3" stroke-width="1.5" opacity=".65"/><g class="lotus-flower" fill="url(#${p}-petal)" stroke="#e3b0bb" stroke-width="1"><path d="M81 104Q34 91 39 58Q72 65 81 104Z"/><path d="M80 104Q127 91 122 58Q89 65 80 104Z"/><path d="M80 103Q52 71 65 39Q93 61 80 103Z"/><path d="M81 103Q109 71 96 39Q68 61 81 103Z"/><path d="M80 102Q57 67 81 27Q103 67 80 102Z"/><path d="M79 105Q46 110 38 83Q65 79 79 105Z"/><path d="M82 105Q115 110 123 83Q96 79 82 105Z"/></g><ellipse cx="81" cy="102" rx="13" ry="5" fill="#eed39b"/>`);
  }
  function daisy(prefix) {
    const p = id(prefix);
    return wrap('daisy', `<defs><linearGradient id="${p}-petal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffdf0"/><stop offset="1" stop-color="#eee4c3"/></linearGradient></defs>${shadow(80,144,29,5)}<path d="M78 139Q87 103 80 67" fill="none" stroke="#73996b" stroke-width="5" stroke-linecap="round"/><path d="M81 119Q57 98 49 112Q52 128 81 125M83 101q21-22 29-7q-3 18-29 15" fill="#a1be80"/><g class="flower-head"><g fill="url(#${p}-petal)">${Array.from({length:10}, (_,i)=>`<ellipse cx="80" cy="45" rx="10" ry="23" transform="rotate(${i*36} 80 70)"/>`).join('')}</g><circle cx="80" cy="70" r="18" fill="#edc876"/><circle cx="74" cy="65" r="2.5" fill="#ffe7a4"/><circle cx="88" cy="73" r="2.4" fill="#d4a958"/><circle cx="73" cy="77" r="2" fill="#d4a958"/></g>`);
  }
  function tulip(prefix) {
    const p = id(prefix);
    return wrap('tulip', `<defs><linearGradient id="${p}-petal" x1=".1" y1="0" x2=".7" y2="1"><stop stop-color="#f6c1c2"/><stop offset=".6" stop-color="#e89caa"/><stop offset="1" stop-color="#ce8295"/></linearGradient></defs>${shadow(80,144,31,5)}<path d="M80 140Q87 111 80 79" fill="none" stroke="#759a70" stroke-width="5"/><path d="M79 138Q42 126 44 90Q72 102 79 138M82 140Q119 118 111 87Q91 102 82 140" fill="#a3be87"/><path d="M79 133L53 107m31 26 20-29" stroke="#7f9f70" stroke-width="2" fill="none"/><g class="flower-head"><path d="M80 91Q53 65 63 29Q78 36 80 48Q86 31 97 28Q110 65 80 91" fill="#d98c9e"/><path d="M79 93Q43 91 42 45Q63 43 79 62Q96 40 119 43Q116 91 79 93Z" fill="url(#${p}-petal)"/><path d="M54 56Q56 74 64 80" stroke="#fbd5d3" stroke-width="4" fill="none" stroke-linecap="round" opacity=".65"/></g>`);
  }
  function hyacinth(prefix) {
    const p = id(prefix);
    const petal=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="url(#${p}-petal)"><ellipse cx="0" cy="-5" rx="5" ry="8"/><ellipse cx="6" cy="1" rx="8" ry="5" transform="rotate(24 6 1)"/><ellipse cx="-6" cy="1" rx="8" ry="5" transform="rotate(-24 -6 1)"/><ellipse cx="0" cy="6" rx="5" ry="7"/><circle r="2.8" fill="#f6dfb3"/></g>`;
    return wrap('hyacinth', `<defs><linearGradient id="${p}-petal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e3d1ec"/><stop offset="1" stop-color="#ad9bc6"/></linearGradient></defs>${shadow(80,144,31,5)}<path d="M80 140V43" stroke="#799e71" stroke-width="5" stroke-linecap="round"/><path d="M78 140Q42 122 49 83Q76 104 78 140M83 140Q118 123 112 85Q86 105 83 140" fill="#a0ba82"/><g class="flower-head">${petal(80,30,.8)}${petal(68,49,.94)}${petal(90,49,.96)}${petal(60,70,1)}${petal(80,70,1.05)}${petal(101,70,1)}${petal(65,91,1)}${petal(89,93,1.05)}</g>`);
  }
  function sunflower(prefix) {
    const p = id(prefix);
    return wrap('sunflower', `<defs><linearGradient id="${p}-petal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f8dc92"/><stop offset="1" stop-color="#e9b563"/></linearGradient><radialGradient id="${p}-center" cx=".3" cy=".25"><stop stop-color="#b79b76"/><stop offset="1" stop-color="#8b7358"/></radialGradient></defs>${shadow(80,144,29,5)}<path d="M80 140V73" fill="none" stroke="#78996c" stroke-width="5"/><path d="M78 123Q46 120 47 99Q74 101 78 123M82 112Q114 111 113 91Q88 92 82 112" fill="#a1b97b"/><g class="flower-head"><g fill="url(#${p}-petal)">${Array.from({length:12},(_,i)=>`<ellipse cx="80" cy="39" rx="9" ry="20" transform="rotate(${i*30} 80 66)"/>`).join('')}</g><circle cx="80" cy="66" r="23" fill="url(#${p}-center)"/><g fill="#dcc299" opacity=".7"><circle cx="70" cy="57" r="2"/><circle cx="82" cy="52" r="2"/><circle cx="91" cy="59" r="2"/><circle cx="69" cy="71" r="2"/><circle cx="80" cy="65" r="2"/><circle cx="91" cy="73" r="2"/><circle cx="80" cy="79" r="2"/></g></g>`);
  }
  function rabbit(prefix) {
    const p = id(prefix);
    return wrap('rabbit', `<defs><radialGradient id="${p}-fur" cx=".35" cy=".25" r=".85"><stop stop-color="#fff8e9"/><stop offset=".6" stop-color="#f1e4cb"/><stop offset="1" stop-color="#d9c8ad"/></radialGradient></defs>${shadow(81,143,46,6)}<circle cx="43" cy="116" r="16" fill="#f0e6d3"/><ellipse cx="77" cy="111" rx="36" ry="33" fill="url(#${p}-fur)"/><ellipse cx="60" cy="137" rx="18" ry="8" fill="#eadbc2"/><ellipse cx="99" cy="137" rx="18" ry="8" fill="#f4e7d0"/>
      <g class="rabbit-head"><ellipse cx="72" cy="38" rx="12" ry="31" transform="rotate(-11 72 38)" fill="url(#${p}-fur)"/><ellipse cx="105" cy="37" rx="12" ry="31" transform="rotate(12 105 37)" fill="url(#${p}-fur)"/><ellipse cx="72" cy="36" rx="6" ry="22" transform="rotate(-11 72 36)" fill="#e8beb6"/><ellipse cx="105" cy="35" rx="6" ry="22" transform="rotate(12 105 35)" fill="#e8beb6"/>
      <ellipse cx="89" cy="80" rx="35" ry="31" fill="url(#${p}-fur)"/><ellipse cx="74" cy="77" rx="5.5" ry="7.2" fill="#665e51"/><ellipse cx="107" cy="77" rx="5.5" ry="7.2" fill="#665e51"/><circle cx="72.5" cy="74.5" r="2" fill="#fffdf1"/><circle cx="105.5" cy="74.5" r="2" fill="#fffdf1"/><ellipse cx="66" cy="89" rx="7" ry="4.5" fill="#eabfb3"/><ellipse cx="114" cy="89" rx="7" ry="4.5" fill="#eabfb3"/><path d="M85 87q5-3 10 0q0 6-5 6q-5 0-5-6" fill="#cb9d94"/><path d="M90 93v3m0 0q-5 6-10 0m10 0q5 6 10 0" stroke="#8e7e6a" stroke-width="1.8" fill="none" stroke-linecap="round"/></g><path d="M65 113q3 16 11 18m24-18q-1 16-9 18" stroke="#d4c2a7" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
  }
  function squirrel(prefix) {
    const p = id(prefix);
    return wrap('squirrel', `<defs><radialGradient id="${p}-fur" cx=".3" cy=".25" r=".9"><stop stop-color="#e8c496"/><stop offset=".65" stop-color="#ce9f73"/><stop offset="1" stop-color="#ac7d5e"/></radialGradient><linearGradient id="${p}-tail" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e2ba8b"/><stop offset="1" stop-color="#b88360"/></linearGradient></defs>${shadow(80,143,48,6)}<path class="squirrel-tail" d="M63 132C24 144 9 112 17 91C22 75 35 70 32 57C28 43 18 46 20 36C26 15 62 27 66 49C72 75 50 88 48 107Q46 123 63 132Z" fill="url(#${p}-tail)"/><path d="M46 125Q28 104 44 84Q68 50 39 38" fill="none" stroke="#f1ce9f" stroke-width="5" stroke-linecap="round" opacity=".7"/><ellipse cx="85" cy="113" rx="30" ry="31" fill="url(#${p}-fur)"/><ellipse cx="92" cy="115" rx="20" ry="24" fill="#f2dfb8"/><ellipse cx="74" cy="138" rx="17" ry="7" fill="#bd916d"/><ellipse cx="103" cy="138" rx="17" ry="7" fill="#d6ac7f"/><path d="M67 62Q56 38 68 36Q85 39 82 59M104 58Q106 32 118 37Q130 47 116 66" fill="url(#${p}-fur)"/><path d="M68 50l6 7m40-10-5 10" stroke="#bd8e73" stroke-width="5" stroke-linecap="round"/><ellipse cx="93" cy="78" rx="34" ry="29" fill="url(#${p}-fur)"/><ellipse cx="98" cy="90" rx="23" ry="16" fill="#f3dfb7"/><ellipse cx="79" cy="76" rx="5" ry="6.7" fill="#66503f"/><ellipse cx="110" cy="76" rx="5" ry="6.7" fill="#66503f"/><circle cx="78" cy="74" r="1.8" fill="#fff9e7"/><circle cx="109" cy="74" r="1.8" fill="#fff9e7"/><ellipse cx="95" cy="87" rx="4.8" ry="3.5" fill="#98705b"/><path d="M89 95q7 5 14-1" fill="none" stroke="#aa8566" stroke-width="2" stroke-linecap="round"/><ellipse cx="73" cy="87" rx="5.5" ry="3" fill="#daaa90"/><ellipse cx="116" cy="87" rx="5.5" ry="3" fill="#daaa90"/><path d="M73 111q4 13 12 12m25-13q-4 13-13 12" fill="none" stroke="#ae8162" stroke-width="5" stroke-linecap="round"/><ellipse cx="92" cy="120" rx="10" ry="13" fill="#b99a6d"/><path d="M81 115q11-12 22 0Z" fill="#8f7e5e"/><path d="M92 107v-4" stroke="#8f7e5e" stroke-width="3" stroke-linecap="round"/>`);
  }
  function duck(prefix) {
    const p = id(prefix);
    return wrap('duck', `<defs><radialGradient id="${p}-feather" cx=".35" cy=".25" r=".9"><stop stop-color="#fff4bd"/><stop offset=".65" stop-color="#f3d990"/><stop offset="1" stop-color="#e3b975"/></radialGradient></defs>${shadow(81,140,49,6)}<path d="M63 131l-7 11q8 5 20-1l-1-10m25 0 2 10q13 5 19-2l-10-9" fill="#d6a674"/><path d="M52 105Q35 96 30 87Q25 106 38 118" fill="#e7c67f"/><ellipse cx="79" cy="112" rx="45" ry="28" fill="url(#${p}-feather)"/><path class="duck-wing" d="M53 108Q86 91 96 116Q79 134 53 108Z" fill="#e8c67e"/><path d="M61 111q14 9 23 6" fill="none" stroke="#fae4a2" stroke-width="2.5" stroke-linecap="round"/><path d="M83 88Q75 64 83 53Q87 49 91 57Q85 37 99 36Q108 42 104 49Q123 47 129 67Q140 102 110 108Q91 108 83 88" fill="url(#${p}-feather)"/><ellipse cx="115" cy="73" rx="6" ry="7.2" fill="#5f5a49"/><circle cx="113.5" cy="70.5" r="2" fill="#fffdf0"/><ellipse cx="116" cy="89" rx="7" ry="4.5" fill="#e7b49b"/><path d="M129 79Q151 75 148 86Q142 96 128 90Z" fill="#dfa879"/><path d="M131 86l14-1" stroke="#c68e65" stroke-width="1.8" stroke-linecap="round"/>`);
  }
  function frog() {
    return wrap('frog',`${shadow(80,136,51,7)}
      <ellipse cx="53" cy="110" rx="25" ry="21" transform="rotate(-21 53 110)" fill="#719e58"/>
      <ellipse cx="107" cy="110" rx="25" ry="21" transform="rotate(21 107 110)" fill="#719e58"/>
      <ellipse cx="80" cy="102" rx="36" ry="32" fill="#93bd70"/>
      <ellipse cx="80" cy="110" rx="24" ry="20" fill="#e6eabd"/>
      <path d="M39 123Q28 130 31 136Q34 141 57 135L68 124M121 123Q132 130 129 136Q126 141 103 135L92 124" fill="#9ac47a" stroke="#719e58" stroke-width="2"/>
      <path d="M60 100Q51 113 53 132Q54 139 71 134L68 113M100 100Q109 113 107 132Q106 139 89 134L92 113" fill="#a6cd82" stroke="#719e58" stroke-width="2"/>
      <path d="M39 76Q31 41 55 39Q65 38 72 49L88 49Q95 38 105 39Q129 41 121 76Q120 100 80 102Q40 100 39 76Z" fill="#9ac47a"/>
      <path d="M40 79Q53 90 80 91Q107 90 120 79Q116 99 80 101Q44 99 40 79Z" fill="#bdd899"/>
      <ellipse cx="55" cy="57" rx="14" ry="15" fill="#fff9df"/><ellipse cx="105" cy="57" rx="14" ry="15" fill="#fff9df"/>
      <ellipse cx="57" cy="58" rx="7" ry="9" fill="#364d36"/><ellipse cx="103" cy="58" rx="7" ry="9" fill="#364d36"/>
      <circle cx="54" cy="54" r="2.8" fill="white"/><circle cx="100" cy="54" r="2.8" fill="white"/>
      <ellipse cx="50" cy="80" rx="9" ry="5" fill="#efac9c"/><ellipse cx="110" cy="80" rx="9" ry="5" fill="#efac9c"/>
      <path d="M69 78Q80 90 91 78" fill="none" stroke="#58794d" stroke-width="2.7" stroke-linecap="round"/>`);
  }
  function fox() {
    return wrap('fox',`${shadow(79,141,58,6)}
      <path d="M76 126Q22 154 16 120Q10 101 33 85Q26 106 48 115Q67 119 81 112Z" fill="#cc7750"/>
      <path d="M16 120Q10 101 33 85Q26 102 39 112Q30 123 16 120Z" fill="#ffecd2"/>
      <ellipse cx="73" cy="110" rx="35" ry="26" fill="#d78856"/>
      <path d="M96 85Q119 100 109 130L109 140H92L89 123Q74 132 56 128L52 140H38Q34 129 43 114" fill="#df925d"/>
      <path d="M37 133H54L52 140H38ZM91 133H109V140H92Z" fill="#794b42"/>
      <path d="M77 86Q97 78 114 94L109 121Q96 126 90 114Z" fill="#fff0d7"/>
      <path d="M73 67L63 32Q83 38 91 54M109 54Q126 33 138 35L133 73" fill="#cd7951"/>
      <path d="M75 57L69 39L86 56M117 57L134 42L130 63" fill="#edb8a4"/>
      <path d="M66 73Q70 50 100 50Q129 49 140 75Q135 93 105 102Q76 95 66 73Z" fill="#e59760"/>
      <path d="M67 74Q89 70 103 88Q121 72 140 75Q135 94 105 102Q77 95 67 74Z" fill="#fff0d7"/>
      <ellipse cx="87" cy="73" rx="4.4" ry="5.2" fill="#563e3a"/><ellipse cx="120" cy="73" rx="4.4" ry="5.2" fill="#563e3a"/>
      <circle cx="86" cy="71" r="1.2" fill="white"/><circle cx="119" cy="71" r="1.2" fill="white"/>
      <path d="M98 88Q104 84 111 88Q107 96 103 94Z" fill="#634543"/>`);
  }
  function raccoon() {
    return wrap('raccoon',`${shadow(80,140,56,6)}
      <path d="M50 123Q24 140 14 124Q6 109 25 99Q31 110 58 110Z" fill="#a19b92"/>
      <path d="M20 102Q16 116 27 131L19 129Q11 125 12 117L13 110ZM31 107Q30 118 40 131L48 127Q40 117 42 111Z" fill="#6e6968"/>
      <ellipse cx="78" cy="110" rx="35" ry="29" fill="#a19b93"/>
      <ellipse cx="86" cy="113" rx="23" ry="24" fill="#e0d7c9"/>
      <ellipse cx="62" cy="134" rx="13" ry="7" fill="#766f6b"/><ellipse cx="97" cy="134" rx="13" ry="7" fill="#766f6b"/>
      <ellipse cx="52" cy="112" rx="10" ry="15" transform="rotate(22 52 112)" fill="#908983"/><ellipse cx="106" cy="112" rx="10" ry="15" transform="rotate(-22 106 112)" fill="#908983"/>
      <circle cx="56" cy="52" r="15" fill="#8e8780"/><circle cx="108" cy="51" r="15" fill="#8e8780"/>
      <circle cx="56" cy="52" r="8" fill="#d5b8af"/><circle cx="108" cy="51" r="8" fill="#d5b8af"/>
      <path d="M42 73Q43 49 81 49Q119 49 124 73Q123 99 83 102Q46 100 42 73Z" fill="#b2aaa0"/>
      <path d="M44 78Q59 65 82 76Q104 65 123 77Q117 93 100 92Q89 91 82 87Q73 92 64 92Q51 93 44 78Z" fill="#645e60"/>
      <path d="M63 91Q82 81 102 91Q97 103 83 104Q68 103 63 91Z" fill="#f0e7d9"/>
      <circle cx="64" cy="80" r="4.3" fill="#fffcf2"/><circle cx="101" cy="80" r="4.3" fill="#fffcf2"/>
      <circle cx="65" cy="80" r="2.4" fill="#4e4648"/><circle cx="100" cy="80" r="2.4" fill="#4e4648"/>
      <ellipse cx="82" cy="92" rx="5.3" ry="3.6" fill="#55474a"/>`);
  }
  function mouse() {
    return wrap('mouse',`${shadow(86,139,54,6)}
      <path d="M61 125Q31 141 16 128Q6 118 19 111" stroke="#c68e89" stroke-width="4" stroke-linecap="round" fill="none"/>
      <ellipse cx="72" cy="109" rx="36" ry="26" fill="#a9a4a2"/>
      <ellipse cx="90" cy="116" rx="22" ry="18" fill="#ddd6cb"/>
      <path d="M45 127Q42 138 59 138H69Q74 133 66 128M89 129Q90 139 112 137Q119 133 108 129" fill="#c18e88"/>
      <circle cx="79" cy="63" r="20" fill="#a9a4a2"/><circle cx="80" cy="64" r="13" fill="#e3b6b1"/>
      <circle cx="113" cy="60" r="18" fill="#aaa4a0"/><circle cx="113" cy="60" r="11" fill="#e3b6b1"/>
      <path d="M65 89Q66 66 106 66Q126 78 143 96Q132 113 105 114Q76 113 65 89Z" fill="#c2bcb7"/>
      <path d="M102 98Q121 97 141 97Q130 112 106 113Z" fill="#ede4d8"/>
      <ellipse cx="109" cy="86" rx="5" ry="6.5" fill="#50474a"/><circle cx="108" cy="84" r="1.6" fill="white"/>
      <ellipse cx="140" cy="97" rx="5" ry="4" fill="#bc7e7b"/>
      <path d="M123 101l20 5m-22-2l16 9" stroke="#89817d" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="109" cy="101" rx="7" ry="4" fill="#e6aaa4"/>`);
  }
  function seahorse() {
    return wrap('seahorse',`
      <path d="M73 60Q47 67 44 88Q58 90 74 79" fill="#f1bd92" stroke="#d08d70" stroke-width="2"/>
      <path d="M72 27Q80 11 99 24L110 31L133 32Q144 40 131 46L109 49Q94 56 103 69Q123 105 103 126Q82 148 61 130Q48 119 56 106Q62 96 77 101Q88 106 83 114Q78 120 71 114" fill="none" stroke="#cd8469" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M72 27Q80 11 99 24L110 31L133 32Q144 40 131 46L109 49Q94 56 103 69Q123 105 103 126Q82 148 61 130Q48 119 56 106Q62 96 77 101Q88 106 83 114Q78 120 71 114" fill="none" stroke="#f3b382" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M88 49Q91 67 101 79Q114 100 104 116" fill="none" stroke="#ffdfb2" stroke-width="6" stroke-linecap="round"/>
      <path d="M77 21Q74 11 83 13L90 17L97 13L101 25" fill="#dd926f"/>
      <ellipse cx="97" cy="35" rx="5.2" ry="6.5" fill="#64514a"/><circle cx="96" cy="33" r="1.7" fill="#fffdf1"/>
      <ellipse cx="108" cy="44" rx="6" ry="4" fill="#ed978c"/>`);
  }
  function strawberry() {
    return wrap('strawberry',`${shadow(80,140,46,6)}
      <path d="M80 139V54M78 103Q57 89 43 92M80 93Q102 77 123 79" fill="none" stroke="#658951" stroke-width="4"/>
      <path d="M77 84Q45 82 38 58Q63 54 77 75Q69 48 87 36Q102 57 83 75Q104 57 127 63Q118 88 84 85Z" fill="#89b069"/>
      <path d="M39 93Q22 92 28 111L41 127Q47 130 51 121Q66 101 54 94Z M111 78Q93 78 99 96L111 114Q117 117 121 107Q136 87 125 81Z" fill="#d66d66"/>
      <path d="M31 94l10-7l4 7l10-2l-8 9l-7-3ZM101 81l10-8l6 7l11 1l-10 6l-7-3Z" fill="#749658"/>
      <path d="M37 107l1 3m7 1l-1 3m66-21l1 3m8 0l-1 3" stroke="#ffe0af" stroke-width="2" stroke-linecap="round"/>`);
  }
  function lavender() {
    return wrap('lavender',`${shadow(80,140,44,6)}
      <path d="M79 140L55 51M81 140L81 33M83 140L111 57" stroke="#72916a" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M73 128Q49 116 43 109Q62 108 75 121M87 127Q105 111 122 110Q114 122 86 134" fill="#99ae83"/>
      ${[[55,51],[81,33],[111,57]].map(([x,y])=>`<g transform="translate(${x} ${y})"><ellipse cy="-9" rx="6" ry="8" fill="#baa1ce"/><ellipse cx="-5" rx="8" ry="5" fill="#9681b6"/><ellipse cx="5" rx="8" ry="5" fill="#b49bc8"/><ellipse cx="-5" cy="10" rx="8" ry="5" fill="#ac92c3"/><ellipse cx="5" cy="10" rx="8" ry="5" fill="#947db3"/><ellipse cy="19" rx="8" ry="4.5" fill="#aa93c2"/></g>`).join('')}`);
  }

  function beetle() {
    return wrap('beetle',`${shadow(80,138,46,6)}
      <path d="M50 79L31 63L21 67M48 97L25 94L17 104M52 114L35 126L34 137M110 79L129 63L139 67M112 97L135 94L143 104M108 114L125 126L126 137" fill="none" stroke="#6e564f" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="80" cy="98" rx="35" ry="39" fill="#926855"/>
      <path d="M79 67Q44 66 46 100Q50 137 79 137ZM82 67Q116 66 114 100Q110 137 82 137Z" fill="#b48264"/>
      <path d="M53 85Q60 74 69 75M97 78Q105 82 108 90" fill="none" stroke="#f5cf9e" stroke-width="4" stroke-linecap="round" opacity=".62"/>
      <ellipse cx="80" cy="59" rx="24" ry="18" fill="#765951"/>
      <path d="M74 55Q78 41 72 35Q64 31 64 20L70 22Q75 29 82 27Q89 26 93 18L96 19Q97 32 87 35Q84 44 86 54Z" fill="#815e4f"/>
      <circle cx="66" cy="57" r="5.5" fill="#fff1cc"/><circle cx="95" cy="57" r="5.5" fill="#fff1cc"/>
      <circle cx="67" cy="58" r="2.7" fill="#504348"/><circle cx="94" cy="58" r="2.7" fill="#504348"/>`);
  }
  function bird() {
    return wrap('bird',`${shadow(80,140,46,6)}
      <path d="M53 106Q27 104 20 82Q36 90 54 87" fill="#89a7b2"/>
      <path d="M68 126l-5 14m25-13l4 13m-37 0h16m14 0h18" fill="none" stroke="#b48560" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="77" cy="104" rx="41" ry="30" fill="#9fbcc4"/>
      <path d="M77 124Q110 129 115 101Q105 83 79 99" fill="#eaf0dc"/>
      <path d="M52 87Q85 84 92 110Q64 123 52 87Z" fill="#7d9faa"/>
      <path d="M58 97Q66 106 80 106" fill="none" stroke="#b9d1cf" stroke-width="3" stroke-linecap="round"/>
      <circle cx="101" cy="71" r="29" fill="#adcad0"/>
      <path d="M88 44Q81 28 95 33L104 43Q107 29 114 35L116 47" fill="#8caeb9"/>
      <path d="M125 74l20 8l-19 7Z" fill="#d9a565"/>
      <ellipse cx="110" cy="69" rx="6" ry="7.2" fill="#465c60"/><circle cx="108" cy="67" r="2" fill="#fffbef"/>
      <ellipse cx="114" cy="85" rx="7" ry="4" fill="#e6b4a2"/>`);
  }
  function owl() {
    return wrap('owl',`${shadow(80,141,45,6)}
      <path d="M54 127l-4 13m10-10l3 9m33-9l-3 9m10-12l6 13" fill="none" stroke="#be8a61" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="80" cy="94" rx="38" ry="43" fill="#bc9273"/>
      <ellipse cx="50" cy="102" rx="15" ry="29" transform="rotate(13 50 102)" fill="#98765e"/>
      <ellipse cx="110" cy="102" rx="15" ry="29" transform="rotate(-13 110 102)" fill="#98765e"/>
      <ellipse cx="80" cy="112" rx="25" ry="24" fill="#efdebd"/>
      <path d="M65 111q5 9 10 0m9 3q5 9 10 0m-23 9q5 9 10 0" fill="none" stroke="#c9ae8d" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M44 62l-3-28l22 11q17-7 34 0l23-11l-5 29q0 30-35 31q-35-1-36-32Z" fill="#ae856b"/>
      <path d="M51 67Q51 49 66 49Q75 49 80 62Q87 49 98 49Q110 49 111 66Q110 85 82 87Q54 86 51 67Z" fill="#f3e0ba"/>
      <circle cx="66" cy="66" r="10" fill="#d5a773"/><circle cx="96" cy="66" r="10" fill="#d5a773"/>
      <circle cx="66" cy="66" r="6.4" fill="#594b49"/><circle cx="96" cy="66" r="6.4" fill="#594b49"/>
      <circle cx="64" cy="64" r="2" fill="#fffdf4"/><circle cx="94" cy="64" r="2" fill="#fffdf4"/>
      <path d="M74 78Q80 73 87 78L80 86Z" fill="#c98f5a"/>`);
  }

  window.GardenArt = Object.freeze({ turtle, ladybug, butterfly, fish, flower, daisy, tulip, hyacinth, sunflower, mushroom, clover, tree, firefly, dragonfly, snail, lotus, rabbit, squirrel, duck, frog, fox, raccoon, mouse, seahorse, strawberry, lavender, beetle, bird, owl });
})();
