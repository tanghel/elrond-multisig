import SVG from 'react-inlinesvg';
import React from 'react';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ReactComponent as BoardMember } from '../../assets/images/clipboard-check.svg';
import { ReactComponent as Proposer } from '../../assets/images/clipboard-list.svg';
import { ReactComponent as Quorum } from '../../assets/images/quorum.svg';
import { ReactComponent as User } from '../../assets/images/user.svg';

export interface StatCardType {
  title?: string;
  value?: string;
  valueUnit?: string;
  svg?: string;
  color?: string;
  percentage?: string;
  tooltipText?: string;
  children?: any;
}

const StatCard = ({
  title = '',
  value = '0',
  valueUnit = '',
  color = '',
  svg = '',
  percentage = '',
  tooltipText = '',
  children = null,
}: StatCardType) => {
  return (
    <div className={`statcard card-bg-${color} text-white py-3 px-4 mb-spacer ml-spacer rounded`}>
      <div className="d-flex align-items-center justify-content-between mt-1 mb-2">
        <div className="icon my-1 fill-white">
          { svg === 'clipboard-check.svg' ?
            <BoardMember style={{ width: 32, height: 32 }} /> :
            svg === 'clipboard-list.svg' ?
            <Proposer style={{ width: 32, height: 32 }} /> :
            svg === 'quorum.svg' ?
            <Quorum style={{ width: 32, height: 32 }} /> :
            svg === 'user.svg' ?
            <User style={{ width: 32, height: 32 }} /> :
            <SVG src={process.env.PUBLIC_URL + '/' + svg} className="text-white"></SVG>
          }
        </div>
        <div>{children}</div>
      </div>
      <span className="opacity-6">{title}</span>
      <p className="h5 mb-0">
        {value} {valueUnit}
      </p>
      <small className="opacity-5">
        {percentage}
        {tooltipText !== '' && (
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={props => (
              <Tooltip id="button-tooltip" {...props}>
                {tooltipText}
              </Tooltip>
            )}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="text-white ml-1" />
          </OverlayTrigger>
        )}
      </small>
    </div>
  );
};

export default StatCard;
