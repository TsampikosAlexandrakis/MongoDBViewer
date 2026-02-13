import React from 'react';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import { useNavigationStore } from '../../store/navigationStore';
import DocumentList from '../documents/DocumentList';
import IndexManager from '../indexes/IndexManager';
import PipelineBuilder from '../aggregation/PipelineBuilder';
import SchemaView from '../schema/SchemaView';

export default function AppShell() {
  const { activeDb, activeCollection, activeTab } = useNavigationStore();

  const renderContent = () => {
    if (!activeDb) {
      return (
        <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
          Select a database from the sidebar
        </div>
      );
    }
    if (!activeCollection) {
      return (
        <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
          Select a collection to browse documents
        </div>
      );
    }

    switch (activeTab) {
      case 'documents': return <DocumentList db={activeDb} collection={activeCollection} />;
      case 'indexes': return <IndexManager db={activeDb} collection={activeCollection} />;
      case 'aggregation': return <PipelineBuilder db={activeDb} collection={activeCollection} />;
      case 'schema': return <SchemaView db={activeDb} collection={activeCollection} />;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[250px] flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 overflow-auto bg-zinc-950">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
