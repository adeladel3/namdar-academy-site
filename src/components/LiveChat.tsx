import { getSettingsGroup } from "@/lib/db";

/**
 * Injects a live-chat provider script (e.g. Goftino, Raychat, Tawk.to).
 * Config is read from site settings:
 *   - `chat.provider`: "goftino" | "raychat" | "tawk" | "off"
 *   - `chat.apiKey`: provider token
 *
 * Renders nothing when disabled. Scripts are sanitized: we only emit known
 * shapes for trusted providers, never arbitrary user-supplied JS.
 *
 * This uses a plain `<script>` tag (not `next/script`) rendered server-side,
 * so the snippet lands in the initial HTML stream and the browser executes
 * it during document parse. `next/script` with `afterInteractive` + inline
 * code defers injection until after hydration, which races with the `load`
 * event the bootstrap listens for and silently fails.
 */
export default function LiveChat() {
  const cfg = getSettingsGroup("chat.") as {
    provider?: string;
    apiKey?: string;
  };
  const provider = cfg.provider;
  const apiKey = cfg.apiKey?.trim();
  if (!provider || provider === "off" || !apiKey) return null;

  const key = escapeToken(apiKey);
  if (!key) return null;

  let snippet = "";
  if (provider === "goftino") {
    snippet = `!function(){var i="${key}",a=window,d=document;function g(){var g=d.createElement("script"),s="https://www.goftino.com/widget/"+i,l=localStorage.getItem("goftino_"+i);g.async=!0,g.src=l?s+"?o="+l:s;d.getElementsByTagName("head")[0].appendChild(g)}"complete"===d.readyState?g():a.attachEvent?a.attachEvent("onload",g):a.addEventListener("load",g,!1)}();`;
  } else if (provider === "raychat") {
    snippet = `(function(){window.RocketChat=function(c){window.RocketChat._.push(c)};window.RocketChat._=[];window.RocketChat.url="https://widget.raychat.io/app/${key}";var s=document.createElement("script");s.async=true;s.src=window.RocketChat.url;(document.head||document.getElementsByTagName("head")[0]).appendChild(s)})();`;
  } else if (provider === "tawk") {
    snippet = `var Tawk_API=Tawk_API||{};(function(){var s=document.createElement("script"),t=document.getElementsByTagName("script")[0];s.async=true;s.src="https://embed.tawk.to/${key}";s.charset="UTF-8";s.setAttribute("crossorigin","*");t.parentNode.insertBefore(s,t)})();`;
  } else {
    return null;
  }

  return (
    <script
      id={`livechat-${provider}`}
      dangerouslySetInnerHTML={{ __html: snippet }}
      suppressHydrationWarning
    />
  );
}

/** Strip any char that could break out of a quoted JS string literal. */
function escapeToken(s: string) {
  return s.replace(/[^a-zA-Z0-9_/.-]/g, "");
}
