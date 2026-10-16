import { useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { IconTrash, IconUpload } from '../ui/icons';

const OUTPUT_SIZE = 480;

async function cropToDataUrl(src: string, area: Area): Promise<string> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return canvas.toDataURL('image/jpeg', 0.88);
}

/** Nuotraukos įkėlimas ir apkirpimas į apskritimą. Saugomas kvadratinis JPEG, apskritimą piešia šablonas. */
export function PhotoField({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  const pick = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSource(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const confirm = async () => {
    if (!source || !area) return;
    onChange(await cropToDataUrl(source, area));
    setSource(null);
  };

  return (
    <div className="photo-field">
      <div className="photo-preview">{value ? <img src={value} alt="Nuotrauka" /> : <span>Nėra nuotraukos</span>}</div>
      <div className="photo-actions">
        <button type="button" className="btn btn-small" onClick={() => inputRef.current?.click()}>
          <IconUpload /> {value ? 'Keisti nuotrauką' : 'Įkelti nuotrauką'}
        </button>
        {value && (
          <>
            <button type="button" className="btn btn-small" onClick={() => setSource(value)}>
              Apkirpti iš naujo
            </button>
            <button
              type="button"
              className="btn btn-small danger"
              onClick={() => window.confirm('Pašalinti nuotrauką?') && onChange(undefined)}
            >
              <IconTrash /> Pašalinti
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {source && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Nuotraukos apkirpimas">
          <div className="modal">
            <h3>Apkirpti nuotrauką</h3>
            <div className="cropper-box">
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, px) => setArea(px)}
              />
            </div>
            <label className="field">
              <span className="field-label">Priartinimas</span>
              <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setSource(null)}>
                Atšaukti
              </button>
              <button type="button" className="btn btn-primary" onClick={confirm}>
                Išsaugoti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
