import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { resizeImage } from "../lib/format";
import { useMe, useSetMe } from "../lib/session";
import type { Me } from "../../shared/types";
import { Avatar, Button, Field, PageHeader, inputClass } from "../components/ui";

export default function EditProfile() {
  const { me } = useMe();
  const setMe = useSetMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(me!.displayName);
  const [username, setUsername] = useState(me!.username);
  const [bio, setBio] = useState(me!.bio);
  const [website, setWebsite] = useState(me!.website);
  const [photo, setPhoto] = useState<string | null>(me!.profilePhoto);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await api.patch<Me>("/me", { displayName, username, bio, website: website.trim(), profilePhoto: photo });
      setMe(updated);
      void qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
      navigate(`/u/${updated.username}`, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl pb-12">
      <PageHeader title="Edit profile" />
      <form onSubmit={save} className="flex flex-col gap-5 px-5 pt-6">
        <div className="flex items-center gap-5">
          <Avatar name={displayName} src={photo} size={88} />
          <div className="flex flex-col gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-surface-2 px-4 text-sm font-semibold">
              <Camera size={16} /> {photo ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) try { setPhoto(await resizeImage(f)); } catch (err) { toast.error(errorMessage(err)); }
              }} />
            </label>
            {photo ? <button type="button" onClick={() => setPhoto(null)} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-coral-text"><Trash2 size={14} /> Remove photo</button> : null}
          </div>
        </div>
        <Field label="Display name"><input className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} required /></Field>
        <Field label="Username" hint="Letters, numbers, dots and underscores. Changing it changes your profile link.">
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-muted">@</span>
            <input className={`${inputClass} pl-8`} value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 24))} required />
          </div>
        </Field>
        <Field label="Bio" hint={`${bio.length}/160`}>
          <textarea className={`${inputClass} h-24 py-3`} value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} placeholder="Curious about tech, healthcare, and everything shaping tomorrow." />
        </Field>
        <Field label="Website" hint="Optional. Include https://">
          <input className={inputClass} type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
        </Field>
        <p className="text-sm text-muted">
          Interests, location, notifications and privacy live in <Link to="/settings" className="font-semibold text-accent-text">Settings</Link>.
        </p>
        <Button type="submit" size="lg" loading={busy}>Save changes</Button>
      </form>
    </div>
  );
}
