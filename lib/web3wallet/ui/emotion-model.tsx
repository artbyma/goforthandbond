import styled from '@emotion/styled'
import React from 'react';

interface ILightboxStyleProps {
  show: boolean;
  offset: number;
  opacity?: number;
}

const SLightbox = styled.div<ILightboxStyleProps>`
  transition: opacity 0.1s ease-in-out;
  text-align: center;
  position: fixed;
  width: 100vw;
  height: 100vh;
  margin-left: -50vw;
  top: ${({ offset }) => (offset ? `-${offset}px` : 0)};
  left: 50%;
  z-index: 2;
  will-change: opacity;
  background-color: ${({ opacity }) => {
  let alpha = 0.4;
  if (typeof opacity === "number") {
    alpha = opacity;
  }
  return `rgba(0, 0, 0, ${alpha})`;
}};
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
  pointer-events: ${({ show }) => (show ? "auto" : "none")};
  display: flex;
  justify-content: center;
  align-items: center;
  & * {
    box-sizing: border-box !important;
  }
`;

const SHitbox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;


interface IModalProps {
  show: boolean,
  onRequestClose: () => void;
  lightboxOpacity: number;
}

interface IModalState {
  lightboxOffset: number;
}

const INITIAL_STATE: IModalState = {
  lightboxOffset: 0
};


export class Modal extends React.Component<IModalProps, IModalState> {
  constructor(props: IModalProps) {
    super(props);
  }

  public lightboxRef?: HTMLDivElement | null;
  public mainModalCard?: HTMLDivElement | null;

  public state: IModalState = {
    ...INITIAL_STATE
  };

  public componentDidUpdate(prevProps: IModalProps, prevState: IModalState) {
    if (this.lightboxRef) {
      const lightboxRect = this.lightboxRef.getBoundingClientRect();
      const lightboxOffset = lightboxRect.top > 0 ? lightboxRect.top : 0;

      if (
          lightboxOffset !== INITIAL_STATE.lightboxOffset &&
          lightboxOffset !== this.state.lightboxOffset
      ) {
        this.setState({ lightboxOffset });
      }
    }
  }

  public render = () => {
    const { lightboxOffset } = this.state;

    const { show, onRequestClose, lightboxOpacity } = this.props;

    return (
        <SLightbox
            offset={lightboxOffset}
            opacity={lightboxOpacity}
            ref={c => (this.lightboxRef = c)}
            show={show}
            style={{
              display: !show ? 'none' : 'block'
            }}
        >
          <SHitbox onClick={onRequestClose} />
          {this.props.children}
        </SLightbox>
    );
  };
}