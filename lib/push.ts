export async function registerPush(): Promise<"subscribed" | "denied" | "error"> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "error";

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";

    const reg = await navigator.serviceWorker.ready;
    const keyRes = await fetch("/api/push/key");
    const { publicKey } = await keyRes.json();

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });

    return "subscribed";
  } catch {
    return "error";
  }
}

export async function resubscribePush(): Promise<"subscribed" | "denied" | "error"> {
  try {
    if (!("serviceWorker" in navigator)) return "error";

    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: existing.endpoint }),
      });
      await existing.unsubscribe();
    }

    return registerPush();
  } catch {
    return "error";
  }
}
