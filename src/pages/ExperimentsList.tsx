import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ArrowUpDown, Calendar, Eye, MoreHorizontal, Plus, Search, Edit2, Trash2, Filter, Grid, List, X, ChevronDown, CalendarIcon, Trophy, Star, Copy } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useExperimentos } from '@/hooks/useSupabaseData';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { CANAIS, CANAIS_OPTIONS, getChannelsByCategory, getChannelIcon } from "@/constants/canais";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useDuplicateExperiment } from '@/hooks/useDuplicateExperiment';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExperimentsListShellSkeleton } from '@/components/ui/page-shell-skeleton';

interface ExperimentoExtended {
  id: string;
  nome: string;
  tipo?: string;
  status?: string;
  responsavel?: string;
  data_inicio?: string;
  data_fim?: string;
  canais?: string[];
  experimento_sucesso?: boolean;
  resultados?: {
    matriz_ice?: { impacto: number; confianca: number; facilidade: number };
    roi?: number;
  }[];
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'concluido':
      return { variant: 'default' as const, color: 'bg-green-500 text-white', label: '✅ Concluído' };
    case 'em_andamento':
      return { variant: 'default' as const, color: 'bg-blue-500 text-white', label: '🔵 Em execução' };
    case 'planejado':
      return { variant: 'secondary' as const, color: 'bg-gray-500 text-white', label: '🟢 Planejado' };
    case 'cancelado':
      return { variant: 'destructive' as const, color: 'bg-red-500 text-white', label: '❌ Cancelado' };
    default:
      return { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800', label: 'N/A' };
  }
};

const getTypeColor = (type?: string) => {
  switch (type) {
    case 'A/B Test':
      return 'bg-blue-100 text-blue-800';
    case 'Multivariate':
      return 'bg-purple-100 text-purple-800';
    case 'Landing Page':
      return 'bg-green-100 text-green-800';
    case 'Email':
      return 'bg-orange-100 text-orange-800';
    case 'Social Media':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};


const TYPES = [
  'A/B Test',
  'Multivariate',
  'Landing Page',
  'Email',
  'Social Media'
];

const STATUS_OPTIONS = [
  { value: 'planejado', label: 'Planejado' },
  { value: 'em_andamento', label: 'Em Execução' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' }
];

const ROI_RANGES = [
  { value: 'negative', label: '< 0%' },
  { value: 'low', label: '0-50%' },
  { value: 'medium', label: '50-100%' },
  { value: 'high', label: '> 100%' }
];

const ICE_RANGES = [
  { value: 'low', label: '0-3' },
  { value: 'medium', label: '4-6' },
  { value: 'high', label: '7-10' }
];

const DURATION_RANGES = [
  { value: 'short', label: '< 7 dias' },
  { value: 'medium', label: '7-30 dias' },
  { value: 'long', label: '> 30 dias' }
];

const ITEMS_PER_PAGE = 20;

export default function ExperimentsList() {
  const navigate = useNavigate();
  const { experimentos, loading: isLoading } = useExperimentos();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedROI, setSelectedROI] = useState<string>('');
  const [selectedICE, setSelectedICE] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [hasResults, setHasResults] = useState<string>('');
  const [onlySuccess, setOnlySuccess] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [openChannelCategories, setOpenChannelCategories] = useState<Record<string, boolean>>({});
  const [typeComboboxOpen, setTypeComboboxOpen] = useState(false);
  const { duplicateExperiment, duplicating } = useDuplicateExperiment();

  // Helper functions for filtering
  const getROIFromExperiment = (exp: ExperimentoExtended) => {
    if (!exp.resultados || exp.resultados.length === 0) return null;
    return exp.resultados[0]?.roi || 0;
  };

  const getICEScoreFromExperiment = (exp: ExperimentoExtended) => {
    if (!exp.resultados || exp.resultados.length === 0) return null;
    const ice = exp.resultados[0]?.matriz_ice;
    if (!ice) return null;
    return ((ice.impacto || 0) + (ice.confianca || 0) + (ice.facilidade || 0)) / 3;
  };

  const getDurationFromExperiment = (exp: ExperimentoExtended) => {
    if (!exp.data_inicio || !exp.data_fim) return null;
    return differenceInDays(new Date(exp.data_fim), new Date(exp.data_inicio));
  };

  // Filter experiments
  const filteredExperiments = (experimentos || []).filter((exp: ExperimentoExtended) => {
    const matchesSearch = exp.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypes.length === 0 || (exp.tipo && selectedTypes.includes(exp.tipo));
    const matchesStatus = !selectedStatus || selectedStatus === "all" || exp.status === selectedStatus;
    const matchesChannel = selectedChannels.length === 0 || 
      (exp.canais && exp.canais.some(canal => selectedChannels.includes(canal)));
    
    // Date range filter
    let matchesDate = true;
    if (dateRange?.from && exp.data_inicio) {
      matchesDate = matchesDate && new Date(exp.data_inicio) >= dateRange.from;
    }
    if (dateRange?.to && exp.data_fim) {
      matchesDate = matchesDate && new Date(exp.data_fim) <= dateRange.to;
    }

    // ROI filter
    let matchesROI = true;
    if (selectedROI) {
      const roi = getROIFromExperiment(exp);
      if (roi !== null) {
        switch (selectedROI) {
          case 'negative':
            matchesROI = roi < 0;
            break;
          case 'low':
            matchesROI = roi >= 0 && roi <= 50;
            break;
          case 'medium':
            matchesROI = roi > 50 && roi <= 100;
            break;
          case 'high':
            matchesROI = roi > 100;
            break;
        }
      } else {
        matchesROI = false;
      }
    }

    // ICE Score filter
    let matchesICE = true;
    if (selectedICE) {
      const ice = getICEScoreFromExperiment(exp);
      if (ice !== null) {
        switch (selectedICE) {
          case 'low':
            matchesICE = ice <= 3;
            break;
          case 'medium':
            matchesICE = ice > 3 && ice <= 6;
            break;
          case 'high':
            matchesICE = ice > 6;
            break;
        }
      } else {
        matchesICE = false;
      }
    }

    // Duration filter
    let matchesDuration = true;
    if (selectedDuration) {
      const duration = getDurationFromExperiment(exp);
      if (duration !== null) {
        switch (selectedDuration) {
          case 'short':
            matchesDuration = duration < 7;
            break;
          case 'medium':
            matchesDuration = duration >= 7 && duration <= 30;
            break;
          case 'long':
            matchesDuration = duration > 30;
            break;
        }
      } else {
        matchesDuration = false;
      }
    }

    // Results documented filter
    let matchesResults = true;
    if (hasResults) {
      const hasDocumentedResults = exp.resultados && exp.resultados.length > 0;
      matchesResults = hasResults === 'with' ? hasDocumentedResults : !hasDocumentedResults;
    }

    // Success filter
    let matchesSuccess = true;
    if (onlySuccess) {
      matchesSuccess = exp.experimento_sucesso === true;
    }

    return matchesSearch && matchesType && matchesStatus && matchesChannel && 
           matchesDate && matchesROI && matchesICE && matchesDuration && 
           matchesResults && matchesSuccess;
  });

  // Sort experiments
  const sortedExperiments = [...filteredExperiments].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField as keyof ExperimentoExtended] || '';
    const bValue = b[sortField as keyof ExperimentoExtended] || '';
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedExperiments.length / ITEMS_PER_PAGE);
  const paginatedExperiments = sortedExperiments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedStatus('');
    setSelectedChannels([]);
    setDateRange(undefined);
    setSelectedROI('');
    setSelectedICE('');
    setSelectedDuration('');
    setHasResults('');
    setOnlySuccess(false);
    setSortField('');
    setCurrentPage(1);
  };

  const handleChannelChange = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const removeType = (type: string) => {
    setSelectedTypes(selectedTypes.filter(t => t !== type));
  };

  const toggleChannelCategory = (categoria: string) => {
    setOpenChannelCategories(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

  const handleEdit = (experimentId: string) => {
    navigate(`/experimentos/${experimentId}/editar`);
  };

  const handleDelete = (experimentId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este experimento?')) {
      // TODO: Implementar lógica de exclusão
      console.log('Excluir experimento:', experimentId);
    }
  };

  const handleDuplicate = async (experimentId: string) => {
    await duplicateExperiment(experimentId);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <ExperimentsListShellSkeleton />;
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experimentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus experimentos de marketing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/experimentos/novo')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Experimento
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
          >
            {viewMode === 'table' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Use os filtros para encontrar experimentos específicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter with Combobox */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Experimento</label>
              <Popover open={typeComboboxOpen} onOpenChange={setTypeComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={typeComboboxOpen}
                    className="w-full justify-between"
                  >
                    {selectedTypes.length > 0 
                      ? `${selectedTypes.length} tipo(s) selecionado(s)`
                      : "Selecionar tipos..."
                    }
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar tipos..." />
                    <CommandList>
                      <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
                      <CommandGroup>
                        {TYPES.map((type) => (
                          <CommandItem
                            key={type}
                            value={type}
                            onSelect={() => handleTypeToggle(type)}
                          >
                            <Checkbox
                              checked={selectedTypes.includes(type)}
                              className="mr-2"
                            />
                            {type}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Selected Types as Chips */}
              {selectedTypes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="flex items-center gap-1">
                      {type}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeType(type)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Channel Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Canal ({selectedChannels.length} selecionados)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between text-xs"
                  >
                    {selectedChannels.length > 0
                      ? `${selectedChannels.length} canal(is) selecionado(s)`
                      : "Selecionar canais..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Pesquisar canais..." />
                    <CommandList>
                      <CommandEmpty>Nenhum canal encontrado.</CommandEmpty>
                      {Object.entries(getChannelsByCategory()).map(([categoria, canais]) => (
                        <CommandGroup key={categoria} heading={categoria}>
                          {canais.map((canal) => (
                            <CommandItem
                              key={canal.value}
                              value={canal.value}
                              onSelect={() => handleChannelChange(canal.value)}
                            >
                              <Checkbox
                                checked={selectedChannels.includes(canal.value)}
                                className="mr-2"
                              />
                              <canal.icon className="mr-2 h-4 w-4" />
                              {canal.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Date Range Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yy")} -{" "}
                          {format(dateRange.to, "dd/MM/yy")}
                          {dateRange.from && dateRange.to && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({differenceInDays(dateRange.to, dateRange.from)} dias)
                            </span>
                          )}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      "Selecionar período"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Advanced Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* ROI Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">ROI</label>
              <Select value={selectedROI} onValueChange={(value) => setSelectedROI(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {ROI_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ICE Score Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Score ICE</label>
              <Select value={selectedICE} onValueChange={(value) => setSelectedICE(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {ICE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Duração</label>
              <Select value={selectedDuration} onValueChange={(value) => setSelectedDuration(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {DURATION_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Resultados</label>
              <Select value={hasResults} onValueChange={(value) => setHasResults(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="with">Com resultados</SelectItem>
                  <SelectItem value="without">Sem resultados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Success Filter */}
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="success-filter"
                checked={onlySuccess}
                onCheckedChange={(checked) => setOnlySuccess(checked === true)}
              />
              <label
                htmlFor="success-filter"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
              >
                <Trophy className="h-4 w-4 text-yellow-500" />
                Apenas sucessos
              </label>
            </div>
          </div>

          {/* Clear Filters Button */}
          <Button variant="outline" onClick={clearFilters} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Experimentos ({filteredExperiments.length})</CardTitle>
          <CardDescription>
            Página {currentPage} de {totalPages} ({sortedExperiments.length} experimentos encontrados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            {viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('nome')}>
                        Nome
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('tipo')}>
                        Tipo
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('status')}>
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('experimento_sucesso')}>
                        Sucesso
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('responsavel')}>
                        Responsável
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('data_inicio')}>
                        Período
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExperiments.map((exp: ExperimentoExtended) => (
                    <TableRow 
                      key={exp.id}
                      className={cn(
                        exp.experimento_sucesso && "border-l-4 border-l-yellow-400 bg-yellow-50/30"
                      )}
                    >
                      <TableCell>
                        <Link
                          to={`/experimentos/${exp.id}`}
                          className="font-medium hover:underline flex items-center gap-2"
                        >
                          {exp.experimento_sucesso && (
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          )}
                          {exp.nome}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(exp.tipo)}>
                          {exp.tipo || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const statusBadge = getStatusBadge(exp.status);
                          return (
                            <Badge variant={statusBadge.variant} className={statusBadge.color}>
                              {statusBadge.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {exp.experimento_sucesso ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Experimento de Sucesso</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span className="text-muted-foreground">-</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{exp.responsavel || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(exp.data_inicio)}</div>
                          <div className="text-muted-foreground">{formatDate(exp.data_fim)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/experimentos/${exp.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(exp.id)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDuplicate(exp.id)}
                              disabled={duplicating}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive" 
                              onClick={() => handleDelete(exp.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedExperiments.map((exp: ExperimentoExtended) => (
                  <Card 
                    key={exp.id} 
                    className={cn(
                      "hover:shadow-md transition-shadow relative",
                      exp.experimento_sucesso && "border-yellow-400 shadow-yellow-100"
                    )}
                  >
                    {/* Status Badge - Canto Superior Direito */}
                    <div className="absolute top-2 right-2 z-10">
                      {(() => {
                        const statusBadge = getStatusBadge(exp.status);
                        return (
                          <Badge variant={statusBadge.variant} className={statusBadge.color}>
                            {statusBadge.label}
                          </Badge>
                        );
                      })()}
                    </div>

                  {/* Success Trophy - if applicable */}
                  {exp.experimento_sucesso && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="default" className="bg-yellow-500 text-white">
                        🏆
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-2 pr-20">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        <Link
                          to={`/experimentos/${exp.id}`}
                          className="hover:underline"
                        >
                          {exp.nome}
                        </Link>
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/experimentos/${exp.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(exp.id)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDuplicate(exp.id)}
                            disabled={duplicating}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => handleDelete(exp.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-start">
                        <Badge className={getTypeColor(exp.tipo)}>
                          {exp.tipo || 'N/A'}
                        </Badge>
                      </div>
                      {exp.responsavel && (
                        <p className="text-sm text-muted-foreground">
                          Responsável: {exp.responsavel}
                        </p>
                      )}
                      <div className="text-sm text-muted-foreground">
                        <div>Início: {formatDate(exp.data_inicio)}</div>
                        <div>Fim: {formatDate(exp.data_fim)}</div>
                      </div>
                      {exp.canais && exp.canais.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {exp.canais.slice(0, 3).map((canal, index) => (
                            <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                              {getChannelIcon(canal)}
                              {canal}
                            </Badge>
                          ))}
                          {exp.canais.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{exp.canais.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </TooltipProvider>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => navigate('/experimentos/novo')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}