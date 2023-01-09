import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import {
  AsyncState,
  useShoppingListGenerator,
} from '../hooks/useShoppingListGenerator';

import styles from '../styles/Home.module.css';

export async function getStaticProps() {
  return {
    props: {
      clientId: process.env.NOTION_CLIENT_ID,
      redirectUri: process.env.NOTION_REDIRECT_URL,
    },
  };
}

function Embed({
  clientId,
  redirectUri,
}: {
  clientId?: string;
  redirectUri?: string;
}) {
  const { query } = useRouter();
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { progress, generateList } = useShoppingListGenerator({
    accessToken: query.notionToken,
  });
  const getTokenizedLink = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    fetch(`/api/token?code=${code}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.token) {
          setEmbedUrl(
            `${window.location.origin}/embed?notionToken=${res.token}`
          );
        } else if (res.error) {
          setError(res.error);
        }
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    if (query.code && typeof query.code === 'string') {
      getTokenizedLink(query.code);
    }
  }, [query, getTokenizedLink]);

  useEffect(() => {
    setLoading(
      (Object.keys(progress) as (keyof typeof progress)[]).some(
        (key) =>
          progress[key] !== AsyncState.DONE && progress[key] !== AsyncState.NONE
      )
    );
  }, [progress]);
  return (
    <div className={styles.container}>
      {query.notionToken ? (
        <>
          <button disabled={loading} onClick={generateList}>
            Generate List
          </button>
          {loading &&
            (Object.keys(progress) as (keyof typeof progress)[]).map((key) => (
              <div key={key}>
                {key} : {progress[key]}
              </div>
            ))}
        </>
      ) : loading ? (
        <>loading</>
      ) : embedUrl ? (
        <div>here is your embed url : {embedUrl}</div>
      ) : (
        <div>
          {error && <span>Error : {error}. You can retry :</span>}
          <a
            href={`https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}`}
          >
            Get tokenized link
          </a>
        </div>
      )}
    </div>
  );
}

export default Embed;
