import { useState, useMemo } from "react";
import type { DataSource, DataSourceField } from "../types";
import styles from "./DataSourcePicker.module.css";

interface Props {
  sources: DataSource[];
  onSelect: (field: DataSourceField, source: DataSource) => void;
  onCancel: () => void;
}

export function DataSourcePicker({ sources, onSelect, onCancel }: Props) {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<{
    field: DataSourceField;
    source: DataSource;
  } | null>(null);

  const filteredSources = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return sources;
    return sources
      .map((src) => ({
        ...src,
        fields: src.fields.filter(
          (f) =>
            f.label.toLowerCase().includes(q) ||
            src.label.toLowerCase().includes(q)
        ),
      }))
      .filter((src) => src.fields.length > 0);
  }, [sources, search]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleFieldClick(field: DataSourceField, source: DataSource) {
    setSelected({ field, source });
  }

  function handleSelect() {
    if (selected) onSelect(selected.field, selected.source);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Select data element to map">
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>Select data element to map</h3>

        <div className={styles.body}>
          {/* Left panel */}
          <div className={styles.left}>
            <p className={styles.sectionLabel}>Available data</p>
            <input
              className={styles.search}
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search data sources"
            />

            <ul className={styles.sourceList}>
              {filteredSources.map((src) => {
                const isOpen = expandedIds.has(src.id) || search.length > 0;
                return (
                  <li key={src.id}>
                    <button
                      className={styles.sourceHeader}
                      onClick={() => toggleExpand(src.id)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.chevron}>{isOpen ? "∨" : "›"}</span>
                      {src.label}
                    </button>

                    {isOpen && (
                      <ul className={styles.fieldList}>
                        {src.fields.map((field) => {
                          const isSelected =
                            selected?.field.id === field.id &&
                            selected?.source.id === src.id;
                          return (
                            <li
                              key={field.id}
                              className={`${styles.fieldItem} ${isSelected ? styles.fieldSelected : ""}`}
                              onClick={() => handleFieldClick(field, src)}
                              role="option"
                              aria-selected={isSelected}
                            >
                              {field.label}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right panel — preview */}
          <div className={styles.right}>
            {selected && (
              <p className={styles.preview}>
                <strong>{selected.source.label}</strong>
                <br />
                {selected.field.label}
              </p>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onCancel}>
            CANCEL
          </button>
          <button
            className={styles.btnSelect}
            onClick={handleSelect}
            disabled={!selected}
          >
            SELECT
          </button>
        </div>
      </div>
    </div>
  );
}
