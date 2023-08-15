/* eslint-disable prettier/prettier */
/* eslint-disable react/require-default-props */
/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactNode } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function DashboardTile({title, subtitle, icon, expandContent}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  expandContent?: ReactNode;
}) {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="expandOnHover">
      <CardContent>
        <div className="dashboardContainer">
          <div className="dashboardIconContainer">
            <div className="dashboardIcon">{icon} </div>
          </div>
          <div className="">
            <p className="dashboardHeader">{title}</p>
            <p className="dashboardDescription">{subtitle}</p>
          </div>
        </div>
      </CardContent>

      {expandContent ? (
        <>
          <CardActions>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            {expandContent}
          </Collapse>
        </>
      ) : (
        ''
      )}
    </Card>
  );
}

export default DashboardTile;
