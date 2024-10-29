'use client'

import React from 'react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

interface APISettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  modelName: string;
  setModelName: (name: string) => void;
  siteUrl: string;
  setSiteUrl: (url: string) => void;
  siteName: string;
  setSiteName: (name: string) => void;
  saveSettings: () => void;
}

export const APISettings: React.FC<APISettingsProps> = ({
  apiKey,
  setApiKey,
  modelName,
  setModelName,
  siteUrl,
  setSiteUrl,
  siteName,
  setSiteName,
  saveSettings,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenRouter API key"
          />
        </div>
        <div>
          <Label htmlFor="modelName">Model Name</Label>
          <Input
            id="modelName"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="e.g., gpt-4"
          />
        </div>
        <div>
          <Label htmlFor="siteUrl">Site URL</Label>
          <Input
            id="siteUrl"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="Enter your site URL"
          />
        </div>
        <div>
          <Label htmlFor="siteName">Site Name</Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Enter your site name"
          />
        </div>
        <Button onClick={saveSettings}>Save Settings</Button>
      </CardContent>
    </Card>
  );
};