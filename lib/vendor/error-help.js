(function () {
  let container;
  let lastErrorKey;
  const deferred = [];
  const infoUrlMap = getErrorInfoURLs();
  const infoUrls = Object.keys(infoUrlMap).map((key) => {
    return { key, url: infoUrlMap[key] };
  });

  function createKey(args) {
    return args.map((a) => (a || "").toString()).join(" ");
  }

  function createContainer() {
    if (!container) {
      container = document.createElement("div");
      Object.assign(container.style, {
        pointerEvents: "none",
        top: "0",
        left: "0",
        position: "absolute",
        zIndex: 100000,
        width: "100%",
      });
      document.body.appendChild(container);
    }
    if (!container.parentElement) document.body.appendChild(container);
  }

  function clearContainer() {
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.lastChild);
      }
      if (container.parentElement)
        container.parentElement.removeChild(container);
    }
  }

  function render(msg, url, line, col, err) {
    const key = createKey([...arguments]);
    if (key === lastErrorKey) return;
    lastErrorKey = key;
    clearContainer();
    createContainer();

    let file = url;
    if (!file) {
      file = "[Unknown File]";
    } else if (file.includes("/")) {
      file = file.split("/").pop();
    }

    const popup = document.createElement("div");

    const header = popup.appendChild(document.createElement("header"));
    const errorType =
      err && err.constructor && err.constructor.name
        ? err.constructor.name
        : "Error";
    header.textContent = errorType;
    Object.assign(header.style, {
      color: "black",
      fontSize: "12px",
      fontWeight: "bold",
    });

    const lineCol = popup.appendChild(document.createElement("div"));
    let lineSuffix = "";
    if (isFinite(line) && line >= 0) {
      lineSuffix += ` Line <strong>${line}</strong>`;
    }
    if (isFinite(col) && col >= 0) {
      lineSuffix += ` Col <strong>${col}</strong>`;
    }
    lineCol.innerHTML = `<span><em>${file}</em>${lineSuffix}</span>`;
    Object.assign(lineCol.style, {
      fontSize: "12px",
      color: "hsl(0, 0%, 60%)",
    });

    const prefix = errorType.toLowerCase() + ":";
    const uncaughtPrefix = "uncaught " + prefix;
    if (msg.toLowerCase().indexOf(uncaughtPrefix) === 0) {
      msg = msg.slice(uncaughtPrefix.length).trim();
    } else if (msg.toLowerCase().indexOf(prefix) === 0) {
      msg = msg.slice(prefix.length).trim();
    }
    const text = popup.appendChild(document.createElement("div"));
    text.textContent = msg;
    Object.assign(text.style, {
      marginTop: "10px",
    });

    const msgLower = (msg || "").toLowerCase();
    const urlTips = infoUrls.filter((item) => msgLower.includes(item.key));
    urlTips.sort((a, b) => b.key.length - a.key.length);
    const urlTip = urlTips[0];
    if (msg && urlTip) {
      const learnMoreLink = popup.appendChild(document.createElement("a"));
      learnMoreLink.innerHTML = "💡 <u>Learn More About this Error</u>";
      learnMoreLink.href = urlTip.url;
      learnMoreLink.target = "_blank";
      Object.assign(learnMoreLink.style, {
        color: "blue",
        fontSize: "12px",
        marginTop: "10px",
        textDecoration: "none",
      });
    }

    Object.assign(popup.style, {
      pointerEvents: "initial",
      position: "relative",
      margin: "20px",
      borderRadius: "2px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      boxSizing: "border-box",
      background: "#fff",
      fontSize: "14px",
      padding: "20px",
      fontWeight: "normal",
      fontFamily: "monospace",
      wordWrap: "break-word",
      whiteSpace: "pre-wrap",
      color: "#ff0000",
      border: "1px dashed hsla(0, 0%, 50%, 0.25)",
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
    });
    container.appendChild(popup);

    const close = document.createElement("div");
    close.textContent = "×";
    close.onclick = () => clearContainer();
    Object.assign(close.style, {
      pointerEvents: "initial",
      cursor: "pointer",
      position: "absolute",
      border: "1px solid hsla(0, 0%, 50%, 0.25)",
      zIndex: 100,
      fontFamily: "Georgia",
      width: "20px",
      fontWeight: "bold",
      fontSize: "12px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "black",
      height: "20px",
      background: "white",
      boxSizing: "border-box",
      borderRadius: "2px",
      margin: "5px",
      top: "0px",
      right: "0px",
    });
    popup.appendChild(close);

    (async () => {
      try {
        const err = await fetchCodeError(url, line, col);
        if (err) {
          const text = popup.appendChild(document.createElement("div"));
          text.textContent = err;
          Object.assign(text.style, {
            background: "hsl(0, 0%, 95%)",
            padding: "10px",
            fontSize: "12px",
            color: "black",
            width: "100%",
            borderRadius: "2px",
            boxSizing: "border-box",
            marginTop: "10px",
            whiteSpace: "pre",
          });
        }
      } catch (err) {}
    })();
  }

  function eventToArguments(ev) {
    let { message, filename, lineno, colno, error } = ev;
    message = message || "Unknown error";
    error = error || new Error(message);
    filename = filename || null;
    return [message, filename, lineno, colno, error];
  }

  async function fetchCodeError(url, line, col) {
    line = line - 1;
    const resp = await window.fetch(url);
    const text = await resp.text();
    const lines = text.split("\n");
    const pad = 1;
    const hasBefore = line - pad > 0;
    const hasAfter = line + pad + 1 < lines.length;
    const frameBefore = lines.slice(Math.max(0, line - pad), line);
    const frameAfter = lines.slice(
      line + 1,
      Math.min(lines.length, line + pad + 1)
    );
    const frameCur = lines[line];
    const arrow = [...new Array(col - 1).fill(" "), "^"].join("");
    const frame = [
      hasBefore ? "..." : "",
      ...frameBefore,
      frameCur,
      arrow,
      ...frameAfter,
      hasAfter ? "..." : "",
    ];
    return frame.join("\n").trim();
  }

  let hasWarned = false;
  const origWarn = console.warn.bind(console);

  const wrapDupeLog = (fn) => {
    const orig = console[fn];
    let count = 0;
    const maxCount = 10;
    // Optional debug log helper
    const keyMap = {};
    const keyMapCooldown = 1500;
    const createDeleteTimeout = (key) => {
      return setTimeout(() => {
        delete keyMap[key];
      }, keyMapCooldown);
    };

    console[fn] = function () {
      const args = [...arguments];
      const key = createKey(args);
      if (key in keyMap) {
        const entry = keyMap[key];
        clearTimeout(entry.timeout);
        entry.timeout = createDeleteTimeout(key);
        entry.count++;
        if (entry.count > maxCount) {
          if (!hasWarned) {
            origWarn(
              `
The error-help utility has ignored some console.${fn} to reduce visual clutter. You can disable this by omitting the "dedupe-logs" attribute in the error-help script tag.
`.trim()
            );
          }
          hasWarned = true;
          return;
        }
      } else {
        keyMap[key] = {
          count: 1,
          timeout: createDeleteTimeout(key),
        };
      }
      return orig.apply(console, args);
    };
  };

  if (
    "currentScript" in document &&
    document.currentScript &&
    document.currentScript.getAttribute
  ) {
    if (document.currentScript.hasAttribute("dedupe-logs")) {
      wrapDupeLog("log");
      wrapDupeLog("warn");
      wrapDupeLog("error");
      wrapDupeLog("info");
    }
  }

  window.addEventListener(
    "load",
    () => {
      deferred.forEach((args) => render(...args));
      deferred.length = 0;
    },
    false
  );

  function onErrorEvent(args) {
    if (document.readyState !== "complete") {
      deferred.push(args);
      return;
    }
    render(...args);
  }

  window.addEventListener("error", function (ev) {
    ev.preventDefault();
    console.error(ev.error);
    const args = eventToArguments(ev);
    onErrorEvent(args);
  });

  window.addEventListener("unhandledrejection", (ev) => {
    // should trigger 'error' event and render it
    const err = ev.reason;
    if (err.stack) {
      const matched = err.stack.match(/\((.*):(\d*):(\d*)/);
      if (matched) {
        let [, filename, line, column] = matched;
        if (
          filename != null &&
          line != null &&
          isFinite(line) &&
          column != null &&
          isFinite(column)
        ) {
          const message = err.message;
          const urlBase = `${window.location.protocol}//${window.location.host}/`;
          onErrorEvent([message, filename, line, column, err]);
          return;
        }
      }
    }
    // Safari hack for Lastpass extensions
    if (err === "Not implemented on this platform") {
      console.warn(
        `Supressed an unhandled promise rejection with reason:`,
        ev.reason
      );
      return;
    }
    const dummyErr = new Error(
      `An error ocurred, check your DevTools console for details (you can open this with Ctrl/Cmd + Shift + I on most browsers).`
    );
    onErrorEvent([dummyErr.message, null, -1, -1, dummyErr]);
  });

  function getErrorInfoURLs() {
    return {
      "permission denied to access property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Property_access_denied",
      "too much recursion":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion",
      "maximum call stack size exceeded":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion",
      "argument is not a valid code point":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_a_codepoint",
      "invalid code point":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_a_codepoint",
      "invalid array length":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_array_length",
      "invalid array buffer length":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_array_length",
      "invalid date":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_date",
      "provided date is not in valid range":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_date",
      "invalid time value":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_date",
      "precision is out of range":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Precision_range",
      "out of range":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Precision_range",
      "out of range":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Precision_range",
      "toExponential() argument must be between":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Precision_range",
      "toFixed() argument must be between":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Precision_range",
      "toPrecision() argument must be between":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Precision_range",
      "radix must be an integer":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_radix",
      "radix argument must be between":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_radix",
      "repeat count must be less than infinity":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Resulting_string_too_large",
      "repeat count must be non-negative":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Negative_repetition_count",
      "invalid count value":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Negative_repetition_count",
      "assignment to undeclared variable":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Undeclared_var",
      "is not defined":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_defined",
      "can't access lexical declaration":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_access_lexical_declaration_before_init",
      "deprecated caller or arguments usage":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Deprecated_caller_or_arguments_usage",
      "invalid assignment left-hand side":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_assignment_left-hand_side",
      "reference to undefined property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Undefined_prop",
      "prefixed octal literals and octal escape seq. are deprecated":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Deprecated_octal",
      "not allowed in function with non-simple parameters":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Strict_Non_Simple_Params",
      "is a reserved identifier":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Reserved_identifier",
      "unexpected reserved word":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Reserved_identifier",
      "json.parse:":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/JSON_bad_parse",
      "json.parse: bad":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/JSON_bad_parse",
      "malformed formal parameter":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Malformed_formal_parameter",
      "unexpected token":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unexpected_token",
      "using //@ to indicate sourceurl pragmas is deprecated. use //# instead":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Deprecated_source_map_pragma",
      "a declaration in the head of a for-of loop can't have an initializer":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_for-of_initializer",
      "for-of loop variable declaration may not have an initializer":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_for-of_initializer",
      "applying the 'delete' operator to an unqualified name is deprecated":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Delete_in_strict_mode",
      "delete of an unqualified identifier in strict mode":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Delete_in_strict_mode",
      "for-in loop head declarations may not have initializers":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_for-in_initializer",
      "for-in loop variable declaration may not have an initializer":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_for-in_initializer",
      "function statement requires a name":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unnamed_function_statement",
      "function statements require a function name":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unnamed_function_statement",
      "unexpected token '('":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unnamed_function_statement",
      "unexpected token (":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unnamed_function_statement",
      "identifier starts immediately after numeric literal":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Identifier_after_number",
      "unexpected number":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Identifier_after_number",
      "illegal character":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Illegal_character",
      "invalid or unexpected token":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Illegal_character",
      "invalid regular expression flag":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_regexp_flag",
      "missing ) after argument list":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_parenthesis_after_argument_list",
      "missing ) after condition":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_parenthesis_after_condition",
      "missing : after property id":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_colon_after_property_id",
      "missing ; before statement":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_semicolon_before_statement",
      "missing = in const declaration":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_initializer_in_const",
      "missing initializer in const declaration":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_initializer_in_const",
      "missing ] after element list":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_bracket_after_list",
      "missing formal parameter":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_formal_parameter",
      "missing name after . operator":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_name_after_dot_operator",
      "missing variable name":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/No_variable_name",
      "unexpected token =":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/No_variable_name",
      "unexpected token '='":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/No_variable_name",
      "missing } after function body":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_curly_after_function_body",
      "missing } after property list":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Missing_curly_after_property_list",
      "redeclaration of formal parameter":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Redeclared_parameter",
      "has already been declared":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Redeclared_parameter",
      "return not in function":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_return_or_yield",
      "test for equality (==) mistyped as assignment (=)?":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Equal_as_assign",
      "unterminated string literal":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unterminated_string_literal",
      "has no properties":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/No_properties",
      "is (not)":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unexpected_type",
      "is not a constructor":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_a_constructor",
      "is not a function":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_a_function",
      "is not a non-null object":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/No_non-null_object",
      "property description must be an object":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/No_non-null_object",
      "invalid value used in weak set":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/No_non-null_object",
      "is read-only":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Read-only",
      "cannot assign to read only property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Read-only",
      "is not iterable":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/is_not_iterable",
      "is not a function or its return value is not iterable":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/is_not_iterable",
      "more arguments needed":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/More_arguments_needed",
      "reduce of empty array with no initial value":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Reduce_of_empty_array_with_no_initial_value",
      "called on incompatible type":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type",
      "called on incompatible receiver":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type",
      "called on incompatible target":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type",
      "called on incompatible object":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type",
      "bind must be called on a function":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type",
      "can't access dead object":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Dead_object",
      "can't access property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_access_property",
      "can't assign to property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_assign_to_property",
      "cannot create property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_assign_to_property",
      "can't define property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_define_property_object_not_extensible",
      "can't delete non-configurable array element":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Non_configurable_array_element",
      "dannot delete property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Non_configurable_array_element",
      "can't redefine non-configurable property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_redefine_property",
      "cannot redefine property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_redefine_property",
      "right-hand side of 'in' should be an object, got":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/in_operator_no_object",
      "cannot use 'in' operator to search for":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/in_operator_no_object",
      "cyclic object value":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value",
      "converting circular structure to":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value",
      "invalid 'instanceof' operand":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/invalid_right_hand_side_instanceof_operand",
      "right-hand side of 'instanceof' is not":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/invalid_right_hand_side_instanceof_operand",
      "invalid array.prototype.sort argument":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Array_sort_argument",
      "invalid arguments":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Typed_array_invalid_arguments",
      "redeclaration of const":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_const_assignment",
      "assignment to const":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_const_assignment",
      "is non-configurable and can't be deleted":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_delete",
      "cannot delete property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_delete",
      "setting getter-only property":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Getter_only",
      "which has only a getter":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Getter_only",
      "redeclares argument":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Var_hides_argument",
      "malformed uri sequence":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Malformed_URI",
      "uri malformed":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Malformed_URI",
      "warning: 08/09 is not a legal ecma-262 octal constant":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Bad_octal",
      "warning: -file- is being assigned a //# sourcemappingurl, but already has one":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Already_has_pragma",
      "warning: date.prototype.tolocaleformat is deprecated":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Deprecated_toLocaleFormat",
      "warning: javascript 1.6's for-each-in loops are deprecated":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/For-each-in_loops_are_deprecated",
      "is deprecated; use string.prototype":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Deprecated_String_generics",
      "warning: expression closures are deprecated":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Deprecated_expression_closures",
      "warning: unreachable code after return statement":
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Stmt_after_return",
    };
  }
})();
