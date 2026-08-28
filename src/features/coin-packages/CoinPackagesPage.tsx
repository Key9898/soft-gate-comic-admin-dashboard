import { useState } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, Coins } from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Modal,
  PageSEO,
  EmptyState,
  NoSearchResults,
  Toggle,
} from '../../components';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import type { CoinPackage } from '../../types';
import CoinPackagesPageSkeleton from './components/CoinPackagesPageSkeleton';
import {
  isValidBonus,
  isValidCoinAmount,
  isValidPrice,
  nextCoinPackageId,
  packageLabel,
  parsePackInt,
  toPersistedPackage,
  withExclusiveBadges,
  type CoinPackageBadge,
} from '@/lib/coinPackages';

type PackFormState = {
  coins: string;
  price: string;
  bonus: string;
  popular: boolean;
  bestValue: boolean;
};

const emptyForm = (): PackFormState => ({
  coins: '',
  price: '',
  bonus: '',
  popular: false,
  bestValue: false,
});

const formatMmk = (price: number): string => new Intl.NumberFormat('en-US').format(price);

const CoinPackagesPage = () => {
  const { user } = useAuth();
  const { canWriteCatalog } = useStaffAccess();
  const { coinPackages, setCoinPackages, setActivityLogs, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<CoinPackage | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PackFormState>(emptyForm);
  const [formError, setFormError] = useState('');

  const filteredPackages = coinPackages.filter((pack) => {
    const haystack = `${pack.coins} ${pack.price} ${pack.bonus ?? ''}`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  const badgeFlag = (popular: boolean, bestValue: boolean): CoinPackageBadge | null => {
    if (popular) return 'popular';
    if (bestValue) return 'bestValue';
    return null;
  };

  const persistPack = (pack: CoinPackage, isCreate: boolean) => {
    if (!canWriteCatalog) return;
    const stored = toPersistedPackage(pack);
    const flag = badgeFlag(Boolean(stored.popular), Boolean(stored.bestValue));
    const nextList = isCreate
      ? [...coinPackages, stored]
      : coinPackages.map((item) => (item.id === stored.id ? stored : item));
    setCoinPackages(withExclusiveBadges(nextList, stored.id, flag).map(toPersistedPackage));
    appendActivityLog(setActivityLogs, {
      action: isCreate ? 'create' : 'update',
      targetType: 'coin-package',
      targetId: stored.id,
      targetName: packageLabel(stored),
      admin: user,
    });
  };

  const readFormPack = (id: string): CoinPackage | null => {
    const coins = parsePackInt(formData.coins);
    const price = parsePackInt(formData.price);
    const bonusRaw = formData.bonus.trim() === '' ? 0 : parsePackInt(formData.bonus);
    if (coins == null || !isValidCoinAmount(coins)) {
      setFormError('Coins must be a whole number of at least 1.');
      return null;
    }
    if (price == null || !isValidPrice(price)) {
      setFormError('Price must be a whole MMK amount of at least 1.');
      return null;
    }
    if (bonusRaw == null || !isValidBonus(bonusRaw)) {
      setFormError('Bonus must be a whole number of 0 or more.');
      return null;
    }
    return {
      id,
      coins,
      price,
      bonus: bonusRaw,
      popular: formData.popular,
      bestValue: formData.bestValue,
    };
  };

  const handleAdd = () => {
    if (!canWriteCatalog) return;
    const created = readFormPack(nextCoinPackageId(coinPackages));
    if (!created) return;
    persistPack(created, true);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!canWriteCatalog || !selectedPack) return;
    const updated = readFormPack(selectedPack.id);
    if (!updated) return;
    persistPack(updated, false);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!canWriteCatalog || !selectedPack) return;
    setCoinPackages(coinPackages.filter((pack) => pack.id !== selectedPack.id));
    appendActivityLog(setActivityLogs, {
      action: 'delete',
      targetType: 'coin-package',
      targetId: selectedPack.id,
      targetName: packageLabel(selectedPack),
      admin: user,
    });
    setIsDeleteModalOpen(false);
    setSelectedPack(null);
  };

  const openEditModal = (pack: CoinPackage) => {
    setSelectedPack(pack);
    setFormData({
      coins: String(pack.coins),
      price: String(pack.price),
      bonus: pack.bonus ? String(pack.bonus) : '',
      popular: Boolean(pack.popular),
      bestValue: Boolean(pack.bestValue),
    });
    setFormError('');
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const openDeleteModal = (pack: CoinPackage) => {
    setSelectedPack(pack);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setSelectedPack(null);
    setFormError('');
  };

  const formFields = (
    <>
      <Input
        label="Coins"
        type="number"
        min={1}
        step={1}
        value={formData.coins}
        onChange={(e) => setFormData({ ...formData, coins: e.target.value })}
        required
      />
      <Input
        label="Price (MMK)"
        type="number"
        min={1}
        step={1}
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        required
      />
      <Input
        label="Bonus coins"
        type="number"
        min={0}
        step={1}
        value={formData.bonus}
        onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
      />
      <Toggle
        checked={formData.popular}
        label="Popular"
        description="At most one package. Clears Best value on this row."
        onChange={(checked) =>
          setFormData({
            ...formData,
            popular: checked,
            bestValue: checked ? false : formData.bestValue,
          })
        }
      />
      <Toggle
        checked={formData.bestValue}
        label="Best value"
        description="At most one package. Clears Popular on this row."
        onChange={(checked) =>
          setFormData({
            ...formData,
            bestValue: checked,
            popular: checked ? false : formData.popular,
          })
        }
      />
      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
    </>
  );

  return (
    <>
      <PageSEO.CoinPackages />
      {isLoading ? (
        <CoinPackagesPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fg">Coin packages</h1>
              <p className="mt-1 text-fg-muted">Manage shop SKUs for the reader coin store</p>
            </div>
            {canWriteCatalog ? (
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add package
              </Button>
            ) : null}
          </div>

          <Card>
            <div className="mb-6">
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="table-header">Coins</th>
                    <th className="table-header">MMK</th>
                    <th className="table-header">Bonus</th>
                    <th className="table-header">Badge</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredPackages.map((pack) => (
                    <tr key={pack.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium text-fg">
                        {pack.coins.toLocaleString()}
                      </td>
                      <td className="table-cell text-fg-secondary">{formatMmk(pack.price)}</td>
                      <td className="table-cell text-fg-secondary">{pack.bonus ?? '—'}</td>
                      <td className="table-cell text-fg-secondary">
                        {pack.popular ? 'Popular' : pack.bestValue ? 'Best value' : '—'}
                      </td>
                      <td className="table-cell text-right">
                        {canWriteCatalog ? (
                          <div className="relative inline-block">
                            <button
                              type="button"
                              title="Package actions"
                              aria-label="Package actions menu"
                              onClick={() => setOpenMenuId(openMenuId === pack.id ? null : pack.id)}
                              className="rounded-lg p-2 text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg-secondary"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                            {openMenuId === pack.id && (
                              <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-line bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(pack)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-fg-secondary hover:bg-gray-50"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(pack)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {coinPackages.length === 0 ? (
              <EmptyState
                icon={<Coins className="h-8 w-8 text-fg-muted" />}
                title="No coin packages yet"
                description="Add a shop SKU before the reader store can list offers."
                action={
                  canWriteCatalog
                    ? { label: 'Add package', onClick: () => setIsAddModalOpen(true) }
                    : undefined
                }
              />
            ) : filteredPackages.length === 0 ? (
              <NoSearchResults query={searchQuery} onClear={() => setSearchQuery('')} />
            ) : null}
          </Card>

          <Modal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              resetForm();
            }}
            title="Add package"
            size="lg"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
              className="space-y-4"
            >
              {formFields}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Add package</Button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              resetForm();
            }}
            title="Edit package"
            size="lg"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEdit();
              }}
              className="space-y-4"
            >
              {formFields}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedPack(null);
            }}
            title="Delete package"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-fg-secondary">
                Delete the {selectedPack?.coins.toLocaleString()} coin package? This cannot be
                undone. Demo wallet credit already granted is not clawed back.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedPack(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default CoinPackagesPage;
