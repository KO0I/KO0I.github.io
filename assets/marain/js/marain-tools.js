/*
 * marain-tools.js
 *
 * Requires, loaded before this file:
 *   - jquery.min.js
 *   - dict.js       defines: var dict = { ... }
 *   - alpha.js      defines: var alpha = { ... }, optionally var lexorder = [...]
 *   - sentences.js  defines: var sentences = [...]  // only needed for examples
 */

(function (window, document, $) {
  "use strict";

  if (!$) {
    console.error("Marain tools requires jQuery.");
    return;
  }

  function own(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function getDict() {
    return window.dict || {};
  }

  function getAlpha() {
    return window.alpha || {};
  }

  function getSentences() {
    return window.sentences || [];
  }

  function getLexorder() {
    return window.lexorder || [];
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /*
   * Romanization maps
   * =============================================================
   */

  var umap = {
    "A": "ay",
    "C": "tch",
    "E": "ee",
    "G": "ng",
    "H": "ch",
    "L": "ll",
    "O": "oo",
    "S": "sh",
    "T": "th",

    "a": "ah",
    "b": "b",
    "d": "d",
    "e": "eh",
    "f": "f",
    "g": "g",
    "h": "h",
    "i": "ih",
    "j": "je",
    "k": "k",
    "l": "l",
    "m": "m",
    "n": "n",
    "o": "oh",
    "p": "p",
    "r": "r",
    "s": "s",
    "t": "t",
    "u": "uh",
    "v": "v",
    "w": "w",
    "y": "y",
    "z": "z",
    " ": " "
  };

  /*
   * CL456 romanization corrections
   */
  umap["a"] = "a";
  umap["o"] = "o";
  umap["E"] = "i";
  umap["e"] = "e";
  umap["j"] = "ye";
  umap["O"] = "u";

  var punctuation = ['"', ",", "."];
  var numerals = ["0", "1", "2", "3", "4", "5", "6", "7"];

  for (var pi = 0; pi < punctuation.length; pi++) {
    umap[punctuation[pi]] = punctuation[pi];
  }

  for (var ni = 0; ni < numerals.length; ni++) {
    umap[numerals[ni]] = numerals[ni];
  }

  var dmap = {};
  for (var uk in umap) {
    if (own(umap, uk)) {
      dmap[umap[uk]] = uk;
    }
  }

  /*
   * Parenthesis helpers:
   *   ( maps to open-encloser/comma
   *   ) maps to close-encloser/quote
   *
   * Apostrophe is intentionally NOT inserted into the romanization trie.
   * In forms like ra'yuh it acts as a disambiguating separator and is ignored.
   */
  dmap[","] = ",";
  dmap["'"] = '"';
  dmap[")"] = '"';
  dmap["("] = ",";

  /*
   * Nine-bit binary mapping
   * =============================================================
   */

  var bitmap = {
    "w": "100111100",
    "u": "100011001",
    "m": "001001111",
    "h": "101101010",
    "d": "110010011",
    "a": "111100010",
    "p": "100101111",
    "s": "011010101",
    "t": "101111001",
    "i": "110011001",
    "l": "110111010",
    "C": "111010100",
    "k": "001111011",
    "o": "011011100",
    "b": "001011111",
    "H": "011101010",
    "f": "111111001",
    "A": "010101111",
    "v": "111101101",
    "L": "101010111",
    "n": "110111110",
    "E": "101110111",
    "g": "010011110",
    "G": "011110001",
    "z": "101111010",
    "e": "110001111",
    "j": "111101011",
    "S": "110110101",
    "y": "111011110",
    "O": "110011101",
    "r": "101111111",
    "T": "111111011",
    " ": "000000000"
  };

  function sreverse(str) {
    return String(str).split("").reverse().join("");
  }

  var glyphmap = {};
  for (var bg in bitmap) {
    if (own(bitmap, bg)) {
      var glyphKey = parseInt(sreverse(bitmap[bg]), 2);
      glyphmap[glyphKey] = bg;
    }
  }

  function glyphsToBitstring(s) {
    var out = [];
    s = String(s || "");

    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (own(bitmap, c)) {
        out.push(bitmap[c]);
      }
    }

    return out.join(" ");
  }

  function bitstringToGlyphs(s) {
    s = String(s || "");

    var bytesize = 9;
    var out = "";
    var b = "";

    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);

      if (c === "0" || c === "1") {
        b += c;
      }

      if (b.length === bytesize) {
        var k = parseInt(sreverse(b), 2);
        if (own(glyphmap, k)) {
          out += glyphmap[k];
        }
        b = "";
      }
    }

    if (b.length > 0) {
      var leftover = parseInt(sreverse(b), 2);
      if (own(glyphmap, leftover)) {
        out += glyphmap[leftover];
      }
    }

    return out;
  }

  /*
   * Romanization trie
   * =============================================================
   */

  var umt = {
    value: null,
    nodes: {}
  };

  var maxL = 0;

  function insert(t, s) {
    s = String(s || "");
    maxL = Math.max(maxL, s.length);

    if (s.length === 0) {
      t.nodes[s] = {
        value: "",
        nodes: {}
      };
      return;
    }

    var c = s.charAt(0);
    var rest = s.slice(1);

    if (!own(t.nodes, c)) {
      t.nodes[c] = {
        value: c,
        nodes: {}
      };
    }

    insert(t.nodes[c], rest);
  }

  function trieHas(t, s) {
    s = String(s || "");

    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (own(t.nodes, c)) {
        t = t.nodes[c];
      } else {
        return false;
      }
    }

    return own(t.nodes, "");
  }

  function maxmatch(t, s) {
    s = String(s || "");

    var m = 0;

    for (var i = 0; i <= maxL; i++) {
      if (trieHas(t, s.slice(0, i))) {
        m = i;
      }
    }

    return s.slice(0, m);
  }

  function tdRomToM(s) {
    s = String(s || "");
    var out = "";

    while (s.length > 0) {
      var t = maxmatch(umt, s);
      var n = t.length;

      /*
       * If there is no match, skip one character.
       * This is what makes apostrophes work as separators.
       */
      if (n === 0) {
        n = 1;
      }

      s = s.slice(n);

      if (own(dmap, t)) {
        out += dmap[t];
      }
    }

    return out;
  }

  function tdMToRom(s) {
    s = String(s || "");
    var out = "";

    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);

      if (own(umap, c)) {
        /*
         * Insert apostrophe if the previous romanized character plus this
         * glyph would accidentally form another valid romanization.
         *
         * Example: a + y could become ay, which is the A glyph.
         */
        if (out.length > 0) {
          var val = out.charAt(out.length - 1) + c;
          var exists = Object.keys(umap).some(function (k) {
            return umap[k] === val;
          });

          if (exists) {
            out += "'";
          }
        }

        out += umap[c];
      }
    }

    return out;
  }

  for (var mapKey in umap) {
    if (own(umap, mapKey)) {
      insert(umt, umap[mapKey]);
    }
  }

  insert(umt, "(");
  insert(umt, ")");

  /*
   * Morphological analysis
   * =============================================================
   */

  var pron = [
    "^ra:p1sg",
    "^ora:p1pl",
    "^ge:p2sg",
    "^LA:p2pl",
    "^to:p3sg",
    "^wu:p3pl",
    "^oG:p4sg",
    "^oGe:p4pl"
  ];

  var noms = "y?u$:+NOM";
  var acc = "va$:+ACC";
  var dat = "vil$:+DAT";
  var org = "sa$:+ORG";
  var loc = "lE$:+LOC";
  var com = "j$:+COM";

  var tdx = [noms, acc, dat, org, loc, com].concat(pron);

  function transduce(t, s) {
    var parts = String(t || "").split(":");
    var l = parts[0];
    var r = parts.slice(1).join(":");

    return String(s || "").replace(RegExp(l), r);
  }

  function sortedDictWords() {
    var d = getDict();

    return Object.keys(d).sort(function (a, b) {
      return b.length - a.length;
    });
  }

  function analyze(s) {
    s = String(s || "");
    var d = getDict();

    if (/pe\w+t/.test(s)) {
      s = s.replace(/pe(\w+)t/, function (_match, inner) {
        return inner;
      });

      return "seems-to(" + analyze(s) + ")";
    }

    if (own(d, s)) {
      return d[s].gloss || d[s].def || s;
    }

    for (var i = 0; i < tdx.length; i++) {
      s = transduce(tdx[i], s);
    }

    var words = sortedDictWords();

    for (var wi = 0; wi < words.length; wi++) {
      var w = words[wi];

      if (!w) {
        continue;
      }

      if (s.indexOf(w) !== -1 && own(d, w)) {
        var g = d[w].gloss || d[w].def || w;
        return transduce(w + ":" + g, s);
      }
    }

    return s;
  }

  function analysis(s) {
    s = String(s || "");

    if (!s.trim()) {
      return "";
    }

    return s
      .split(/\s+/)
      .map(function (token) {
        return analyze(token);
      })
      .join(" ");
  }

  /*
   * IPA
   * =============================================================
   */

  function charIPA(c) {
    var a = getAlpha();

    if (own(a, c) && a[c].length > 3) {
      return a[c][3];
    }

    return "";
  }

  function IPA(w) {
    w = String(w || "");

    if (!w) {
      return "";
    }

    var a = getAlpha();
    var out = "";

    for (var i = 0; i < w.length; i++) {
      var c = w.charAt(i);
      var next = w.charAt(i + 1);

      /*
       * Context-sensitive y hack from the original page.
       */
      if (
        i < w.length - 1 &&
        c === "y" &&
        own(a, next) &&
        a[next][4] === "c"
      ) {
        out += "ɪ";
      } else {
        out += charIPA(c);
      }
    }

    return out;
  }

  function sentenceIPA(s) {
    s = String(s || "");

    if (!s.trim()) {
      return "//";
    }

    return "/" + s.split(/\s+/).map(IPA).join(" ") + "/";
  }

  /*
   * HTML builders
   * =============================================================
   */

  function buildGlossTr(s) {
    s = String(s || "");

    if (!s.trim()) {
      return "<td></td>";
    }

    return (
      "<td>" +
      s
        .split(/\s+/)
        .map(function (token) {
          return escapeHTML(token);
        })
        .join("</td><td>") +
      "</td>"
    );
  }

  function buildExample(i) {
    var ss = getSentences();
    var item = ss[i];

    if (!item) {
      return "";
    }

    var m = item.marain || "";
    var e = item["en-id"] || item.en || "";

    return (
      '<a id="' +
      escapeHTML(i) +
      '" class="setsentence">' +
      escapeHTML(m) +
      '</a><br>"' +
      escapeHTML(e) +
      '"<p></p>'
    );
  }

  function populateExamples() {
    var $examples = $("#examplesents");

    if (!$examples.length) {
      return;
    }

    var ss = getSentences();

    $examples.empty();

    for (var i = 0; i < ss.length; i++) {
      $examples.append(buildExample(i));
    }
  }

  /*
   * Page state updates
   * =============================================================
   */

  function setSentence(s) {
    if (!$("#inputfield").length) {
      return;
    }

    $("#inputfield").val(s || "");
    updateMarain();
    updateBitstring();
  }

  function updateGloss() {
    var $input = $("#inputfield");

    if (!$input.length) {
      return;
    }

    var s = String($input.val() || "").toLowerCase();
    var m = tdRomToM(s);

    if ($("#maraingloss").length) {
      $("#maraingloss").html(buildGlossTr(analysis(m)));
    }

    if ($("#glossroman").length) {
      $("#glossroman").html(buildGlossTr(s));
    }

    if ($("#marainoriginal").length) {
      $("#marainoriginal").html(buildGlossTr(m));
    }

    if ($("#sentenceipa").length) {
      $("#sentenceipa").text(sentenceIPA(m));
    }
  }

  function updateMarain() {
    var $input = $("#inputfield");

    if (!$input.length) {
      return;
    }

    var s = String($input.val() || "").toLowerCase();
    var t = tdRomToM(s);

    if ($("#marainfield").length) {
      $("#marainfield").text(t);
    }

    if ($("#glyphfield").length) {
      $("#glyphfield").val(t);
    }

    updateGloss();
  }

  function cleanGlyphString(s) {
    s = String(s || "");

    /*
     * Valid Marain glyph characters from the original page:
     *   ACEGHLOSTabedgfihkjmlonpsrutwvyz and whitespace
     *
     * This intentionally excludes c, q, and x.
     */
    var allowed = "ACEGHLOSTabedgfihkjmlonpsrutwvyz";
    var out = "";

    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);

      if (/\s/.test(c) || allowed.indexOf(c) !== -1) {
        out += c;
      }
    }

    return out;
  }

  function updateBitstring() {
    var $glyph = $("#glyphfield");

    if (!$glyph.length) {
      return;
    }

    var s = cleanGlyphString($glyph.val());
    $glyph.val(s);

    if ($("#bitstringfield").length) {
      $("#bitstringfield").val(glyphsToBitstring(s));
    }
  }

  function updateGlyphs() {
    var $bits = $("#bitstringfield");

    if (!$bits.length) {
      return;
    }

    var glyphs = bitstringToGlyphs($bits.val());

    if ($("#glyphfield").length) {
      $("#glyphfield").val(glyphs);
    }
  }

  function updateRoman() {
    var $glyph = $("#glyphfield");

    if (!$glyph.length) {
      return;
    }

    var roman = tdMToRom($glyph.val());

    if ($("#inputfield").length) {
      $("#inputfield").val(roman);
    }

    updateGloss();
  }

  /*
   * Dictionary
   * =============================================================
   */

  function clearDictResult(query, marainGuess) {
    if ($("#dictmarain").length) {
      $("#dictmarain").text(marainGuess || "");
    }

    if ($("#dictroman").length) {
      $("#dictroman").text(query || "");
    }

    if ($("#dictipa").length) {
      $("#dictipa").text("");
    }

    if ($("#dictpos").length) {
      $("#dictpos").text("");
    }

    if ($("#dictdef").length) {
      if (query) {
        $("#dictdef").text("No dictionary entry found.");
      } else {
        $("#dictdef").text("");
      }
    }
  }

  function setDict(s) {
    var d = getDict();
    var query = String(s || "").trim().toLowerCase();

    if (!query) {
      clearDictResult("", "");
      return;
    }

    var m = tdRomToM(query);
    var entry = null;
    var displayRoman = query;
    var displayMarain = m;

    if (own(d, m)) {
      entry = d[m];
    } else if (own(d, query)) {
      /*
       * Allows direct lookup if someone types/pastes the internal Marain key.
       */
      entry = d[query];
      displayMarain = query;
      displayRoman = tdMToRom(query);
    }

    if (!entry) {
      clearDictResult(query, m);
      return;
    }

    var pos = entry.pos || "";
    var def = entry.def || entry.gloss || "";
    var ipa = IPA(displayMarain);

    if ($("#dictmarain").length) {
      $("#dictmarain").text(displayMarain);
    }

    if ($("#dictroman").length) {
      $("#dictroman").text(displayRoman);
    }

    if ($("#dictipa").length) {
      $("#dictipa").text(ipa);
    }

    if ($("#dictpos").length) {
      $("#dictpos").text(pos);
    }

    if ($("#dictdef").length) {
      $("#dictdef").text(def);
    }

    if ($("#seealso").length && entry.seealso) {
      $("#seealso").text(entry.seealso);
    } else if ($("#seealso").length) {
      $("#seealso").empty();
    }
  }

  /*
 * English → Marain reverse dictionary lookup
 * =============================================================
 */

function normalizeEnglishWord(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, "")
    .trim();
}

function entryEnglishTerms(entry) {
  var terms = [];

  if (!entry) {
    return terms;
  }

  /*
   * Optional preferred field for future dict.js entries:
   *
   * "pren": {
   *   gloss: "spaceship",
   *   pos: "noun",
   *   def: "spaceship",
   *   en: ["spaceship", "ship", "vessel"]
   * }
   */
  if (entry.en) {
    if (Array.isArray(entry.en)) {
      terms = terms.concat(entry.en);
    } else {
      terms.push(entry.en);
    }
  }

  if (entry.def) {
    terms.push(entry.def);
  }

  if (entry.gloss) {
    terms.push(entry.gloss);
  }

  /*
   * Split loose definitions like:
   *   "spaceship, vessel"
   *   "to speak; speech"
   *   "ride[v]"
   */
  var expanded = [];

  terms.forEach(function (term) {
    String(term || "")
      .toLowerCase()
      .replace(/\[[^\]]*\]/g, "")
      .split(/[,;/()]+/)
      .forEach(function (piece) {
        piece = piece.trim();
        if (piece) {
          expanded.push(piece);
        }
      });
  });

  return expanded;
}

function scoreEnglishMatch(word, entry) {
  word = normalizeEnglishWord(word);

  if (!word || !entry) {
    return 0;
  }

  var terms = entryEnglishTerms(entry);
  var best = 0;

  terms.forEach(function (term) {
    term = normalizeEnglishWord(term);

    if (!term) {
      return;
    }

    if (term === word) {
      best = Math.max(best, 100);
      return;
    }

    /*
     * Allows "ship" to match "spaceship" weakly, but exact matches win.
     */
    if (term.indexOf(word) !== -1 || word.indexOf(term) !== -1) {
      best = Math.max(best, 40);
      return;
    }

    /*
     * Allows one-word lookup inside short definitions.
     */
    var words = term.split(/\s+/);
    if (words.indexOf(word) !== -1) {
      best = Math.max(best, 60);
    }
  });

  return best;
}

function findMarainByEnglish(word) {
  var d = getDict();
  var bestKey = null;
  var bestEntry = null;
  var bestScore = 0;

  Object.keys(d).forEach(function (key) {
    var entry = d[key];
    var score = scoreEnglishMatch(word, entry);

    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
      bestEntry = entry;
    }
  });

  if (!bestKey) {
    return null;
  }

  return {
    marain: bestKey,
    roman: tdMToRom(bestKey),
    entry: bestEntry,
    score: bestScore
  };
}

function tokenizeEnglishInput(s) {
  s = String(s || "");

  /*
   * Keeps whitespace and punctuation, so:
   *   "spaceship, culture."
   * does not become a gross mashed string.
   */
  return s.match(/[A-Za-z0-9']+|\s+|[^\sA-Za-z0-9']+/g) || [];
}

function englishToMarain(s) {
  var tokens = tokenizeEnglishInput(s);
  var roman = "";
  var glyphs = "";
  var missing = [];

  tokens.forEach(function (token) {
    if (/^\s+$/.test(token)) {
      roman += token;
      glyphs += token;
      return;
    }

    if (/^[^A-Za-z0-9']+$/.test(token)) {
      roman += token;
      glyphs += token;
      return;
    }

    var clean = normalizeEnglishWord(token);
    var found = findMarainByEnglish(clean);

    if (found) {
      roman += found.roman;
      glyphs += found.marain;
    } else {
      roman += "[" + token + "?]";
      glyphs += "[" + token + "?]";
      missing.push(token);
    }
  });

  return {
    roman: roman.trim(),
    glyphs: glyphs.trim(),
    missing: missing
  };
}

function updateEnglishToMarain() {
  var $field = $("#englishfield");

  if (!$field.length) {
    return;
  }

  var input = $field.val();
  var result = englishToMarain(input);

  if ($("#englishMarainRoman").length) {
    $("#englishMarainRoman").text(result.roman);
  }

  if ($("#englishMarainGlyphs").length) {
    $("#englishMarainGlyphs").text(result.glyphs);
  }

  if ($("#englishMarainNotes").length) {
    if (result.missing.length) {
      $("#englishMarainNotes").html(
        "No entries for: " +
          result.missing
            .map(function (word) {
              return '<span class="missing-word">' + escapeHTML(word) + "</span>";
            })
            .join(", ")
      );
    } else {
      $("#englishMarainNotes").empty();
    }
  }
}

  /*
   * URL handling
   * =============================================================
   */

  function urldecode(str) {
    return decodeURIComponent(String(str || "").replace(/\+/g, "%20"));
  }

  function checkURL() {
    if (!$("#inputfield").length) {
      return;
    }

    var s = urldecode(window.location.search || "");

    if (s.charAt(0) === "?" && s.length > 1) {
      setSentence(s.slice(1));
    }
  }

  /*
   * DOM ready
   * =============================================================
   */

  $(document).ready(function () {
    var $input = $("#inputfield");
    var $glyph = $("#glyphfield");
    var $bits = $("#bitstringfield");
    var $dictsearch = $("#dictsearch");
    var $englishfield = $("#englishfield");

    if ($dictsearch.length) {
      $dictsearch.on("input paste", function () {
        setDict(this.value);
      });
    
      if ($dictsearch.val()) {
        setDict($dictsearch.val());
      } else {
        setDict("pren");
      }
    }
    
    if ($englishfield.length) {
      $englishfield.on("input paste", function () {
        updateEnglishToMarain();
      });
    
      if ($englishfield.val()) {
        updateEnglishToMarain();
      }
    }

    /*
     * Full romanization/converter page
     */
    if ($input.length) {
      $input.on("input paste", function () {
        updateMarain();
        updateBitstring();
      });

      if (!$input.val()) {
        $input.val("ra'yuh prenva zawen");
      }

      updateMarain();
      updateBitstring();
      checkURL();
    }

    if ($glyph.length) {
      $glyph.on("input paste", function () {
        updateBitstring();
        updateRoman();
      });
    }

    if ($bits.length) {
      $bits.on("input paste", function () {
        updateGlyphs();
        updateRoman();
      });
    }

    /*
     * Dictionary-only page.
     * This is the important part for marain.md.
     */
    if ($dictsearch.length) {
      $dictsearch.on("input paste", function () {
        setDict(this.value);
      });

      if ($dictsearch.val()) {
        setDict($dictsearch.val());
      } else {
        setDict("pren");
      }
    }

    /*
     * Example sentence block, if present.
     */
    if ($("#examplesents").length) {
      populateExamples();

      $("#examplesents").on("click", ".setsentence", function () {
        var i = parseInt(this.id, 10);
        var ss = getSentences();

        if (ss[i] && ss[i].marain) {
          setSentence(ss[i].marain);
        }
      });
    }

    /*
     * Alphabet table, if present.
     */
    if ($("#marainab").length && $("#romanab").length) {
      var lex = getLexorder();

      if (lex.length && $("#marainab").children().length === 0) {
        for (var i = 0; i < lex.length; i++) {
          var ch = lex[i];
          var rom = umap[ch] || "";

          $("#marainab").append($("<td>").text(ch));
          $("#romanab").append($("<td>").text(rom));
        }
      }
    }


  });

  /*
   * Expose helpers for debugging and for old inline page hooks.
   */
  window.MarainTools = {
    tdRomToM: tdRomToM,
    tdMToRom: tdMToRom,
    glyphsToBitstring: glyphsToBitstring,
    bitstringToGlyphs: bitstringToGlyphs,
    analyze: analyze,
    analysis: analysis,
    IPA: IPA,
    sentenceIPA: sentenceIPA,
    setDict: setDict,
    setSentence: setSentence,
    updateGloss: updateGloss,
    updateMarain: updateMarain,
    updateBitstring: updateBitstring,
    updateGlyphs: updateGlyphs,
    updateRoman: updateRoman
  };

  /*
   * Backwards-compatible globals.
   */
  window.tdRomToM = tdRomToM;
  window.tdMToRom = tdMToRom;
  window.glyphsToBitstring = glyphsToBitstring;
  window.bitstringToGlyphs = bitstringToGlyphs;
  window.setDict = setDict;
  window.setSentence = setSentence;
})(window, document, window.jQuery);
