'use client'

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { OperatorType } from '../utils/api-utils';

interface OperatorPanelProps {
  onOperatorApply: (operatorType: OperatorType) => void;
}

export const OperatorPanel: React.FC<OperatorPanelProps> = ({ onOperatorApply }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operators</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {Object.values(OperatorType).map((operatorType) => (
          <Button
            key={operatorType}
            onClick={() => onOperatorApply(operatorType)}
            variant="outline"
          >
            {operatorType}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
