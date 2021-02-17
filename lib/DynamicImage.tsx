import {useCallback, useState} from "react";

export function DynamicImage(props: {
  url: string
}) {
  const [failed, setFailed] = useState(false);
  const handleLoad = useCallback(() => {

  }, []);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  if (failed) {
    return <div style={{width: '100%', height: '250px', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid silver'}}>
      <div>Rendering...</div>
      <div>View Live</div>
    </div>
  }

  return <img
      src={props.url}
      onLoad={handleLoad}
      onError={handleError}
  />
}
