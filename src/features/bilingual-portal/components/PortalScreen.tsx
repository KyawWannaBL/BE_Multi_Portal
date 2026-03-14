import { useTranslation } from 'react-i18next';
import PortalTable from './PortalTable';
import { usePortalList } from '../hooks/usePortalList';
import type { ScreenConfig } from '../types';

type Props = {
  screen: ScreenConfig;
};

export default function PortalScreen({ screen }: Props) {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language || 'en').startsWith('my') ? 'my' : 'en';
  const { data, loading, error } = usePortalList(screen.endpoint);

  return (
    <section style={{ padding: '16px' }}>
      <h1>{screen.title[lang]}</h1>
      <p>{screen.description[lang]}</p>

      {!!screen.mergeCandidateKeys?.length && (
        <small>
          Merge candidates: {screen.mergeCandidateKeys.join(', ')}
        </small>
      )}

      <div style={{ marginTop: '16px' }}>
        {loading && <div>{t('loading')}</div>}
        {error && <div>{t('error')}: {error}</div>}
        {!loading && !error && <PortalTable columns={screen.columns} rows={data} />}
      </div>
    </section>
  );
}
