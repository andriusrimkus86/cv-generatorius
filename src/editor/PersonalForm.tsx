import type { PersonalInfo } from '../model/types';
import { useEditorStore } from '../store/useEditorStore';
import { TextField } from './fields';
import { KeyValueEditor } from './ListEditors';
import { PhotoField } from './PhotoField';

export function PersonalForm({ personal }: { personal: PersonalInfo }) {
  const update = useEditorStore((s) => s.update);
  const set = <K extends keyof PersonalInfo>(key: K, value: PersonalInfo[K]) =>
    update((d) => {
      d.personal[key] = value;
    });

  return (
    <div className="form-stack">
      <PhotoField value={personal.photo} onChange={(v) => set('photo', v)} />
      <div className="form-grid">
        <TextField label="Vardas" value={personal.firstName} autoComplete="given-name" onChange={(v) => set('firstName', v)} />
        <TextField label="Pavardė" value={personal.lastName} autoComplete="family-name" onChange={(v) => set('lastName', v)} />
      </div>
      <TextField label="Adresas" value={personal.address} autoComplete="street-address" onChange={(v) => set('address', v)} />
      <div className="form-grid">
        <TextField
          label="Telefonas"
          type="tel"
          inputMode="tel"
          value={personal.phone}
          autoComplete="tel"
          onChange={(v) => set('phone', v)}
        />
        <TextField
          label="El. paštas"
          type="email"
          inputMode="email"
          value={personal.email}
          autoComplete="email"
          onChange={(v) => set('email', v)}
        />
      </div>
      <div className="form-grid">
        <TextField label="Gimimo data" type="date" value={personal.birthDate ?? ''} onChange={(v) => set('birthDate', v || undefined)} />
        <TextField
          label="Šeimyninė padėtis"
          value={personal.maritalStatus ?? ''}
          onChange={(v) => set('maritalStatus', v || undefined)}
        />
      </div>
      <TextField
        label="Vairuotojo pažymėjimas (kategorijos)"
        value={personal.drivingLicence ?? ''}
        placeholder="pvz. B"
        onChange={(v) => set('drivingLicence', v || undefined)}
      />
      <div className="field">
        <span className="field-label">Papildomi laukai (rodomi sekcijoje „Asmeninė informacija“)</span>
        <KeyValueEditor items={personal.customFields} onChange={(items) => set('customFields', items)} />
      </div>
    </div>
  );
}
