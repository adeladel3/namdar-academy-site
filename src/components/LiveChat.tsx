import { getSettingsGroup } from "@/lib/db";

/**
 * Injects a live-chat provider script (e.g. Goftino, Raychat, Tawk.to).
 * Config is read from site settings:
 *   - `chat.provider`: "goftino" | "raychat" | "tawk" | "off"
 *   - `chat.apiKey`: provider token
 *
 * Renders nothing when disabled. Scripts are sanitized: we only emit known
 * shapes for trusted providers, never arbitrary user-supplied JS.
 */
export default function LiveChat() {
  const cfg = getSettingsGroup("chat.") as {
    provider?: string;
    apiKey?: string;
  };
  const provider = cfg.provider;
  const apiKey = cfg.apiKey?.trim();
  if (!provider || provider === "off" || !apiKey) return null;

  let script = "";
  if (provider === "goftino") {
    script = `!function(){var i="${escapeToken(apiKey)}",a=window,d=document;function g(){var g=d.createElement("script"),s="https://www.goftino.com/widget/"+i,l=localStorage.getItem("goftino_"+i);g.async=!0,g.src=l?s+"?o="+l:s;d.getElementsByTagName("head")[0].appendChild(g)}"complete"===d.readyState?g():a.attachEvent?a.attachEvent("onload",g):a.addEventListener("load",g,!1)}();`;
  } else if (provider === "raychat") {
    script = `(function(){window.RocketChat=function(c){window.RocketChat._.push(c)};window.RocketChat._=[];window.RocketChat.url="https://widget.raychat.io/app/${escapeToken(apiKey)}";var s=document.createElement("script");s.async=true;s.src=window.RocketChat.url;(document.head||document.getElementsByTagName("head")[0]).appendChild(s);})();`;
  } else if (provider === "tawk") {
    script = `var Tawk_API=Tawk_API||{};(function(){var s=document.createElement("script"),t=document.getElementsByTagName("script")[0];s.async=true;s.src="https://embed.tawk.to/${escapeToken(apiKey)}";s.charset="UTF-8";s.setAttribute("crossorigin","*");t.parentNode.insertBefore(s,t);})();`;
  } else {
    return null;
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}

/** Strip any char that could break out of a quoted JS string literal. */
function escapeToken(s: string) {
  return s.replace(/[^a-zA-Z0-9_/.-]/g, "");
}
