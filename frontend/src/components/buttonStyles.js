import styled from 'styled-components';
import { Button } from '@mui/material';

const palette = {
  primary: '#2F8C56',
  primaryDark: '#256F45',
  secondary: '#E6A23A',
  secondaryDark: '#CC861E',
  neutralDark: '#1F2933',
};

export const RedButton = styled(Button)`
  && {
    background-color: ${palette.secondary};
    color: white;
    margin-left: 4px;
    &:hover {
      background-color: ${palette.secondaryDark};
      border-color: ${palette.secondaryDark};
      box-shadow: none;
    }
  }
`;

export const BlackButton = styled(Button)`
  && {
    background-color: ${palette.primary};
    color: white;
    margin-left: 4px;
    &:hover {
      background-color: ${palette.primaryDark};
      border-color: ${palette.primaryDark};
      box-shadow: none;
    }
  }
`;

export const DarkRedButton = styled(Button)`
  && {
    background-color: ${palette.primaryDark};
    color: white;
    &:hover {
      background-color: ${palette.primary};
      border-color: ${palette.primary};
      box-shadow: none;
    }
  }
`;

export const BlueButton = styled(Button)`
  && {
    background-color: ${palette.primary};
    color: #fff;
    &:hover {
      background-color: ${palette.primaryDark};
    }
  }
`;

export const PurpleButton = styled(Button)`
  && {
    background-color: ${palette.secondary};
    color: #fff;
    &:hover {
      background-color: ${palette.secondaryDark};
    }
  }
`;

export const LightPurpleButton = styled(Button)`
  && {
    background-color: ${palette.secondary};
    color: #fff;
    &:hover {
      background-color: ${palette.secondaryDark};
    }
  }
`;

export const GreenButton = styled(Button)`
  && {
    background-color: ${palette.primary};
    color: #fff;
    &:hover {
      background-color: ${palette.primaryDark};
    }
  }
`;

export const BrownButton = styled(Button)`
  && {
    background-color: ${palette.neutralDark};
    color: white;
    &:hover {
      background-color: #111827;
      border-color: #111827;
      box-shadow: none;
    }
  }
`;

export const IndigoButton = styled(Button)`
  && {
    background-color: ${palette.primary};
    color: white;
    &:hover {
      background-color: ${palette.primaryDark};
      border-color: ${palette.primaryDark};
      box-shadow: none;
    }
  }
`;
