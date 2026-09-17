/** Bloc de données structurées Schema.org (rendu côté serveur). */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  // "<" est remplacé par son échappement JSON pour qu'aucune valeur ne puisse fermer le script.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
