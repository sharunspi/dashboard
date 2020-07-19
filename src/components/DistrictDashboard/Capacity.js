import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { careFacilitySummary } from "../../utils/api";
import { availabilityTypes } from "../../utils/constants";
import { dateString, getNDateAfter, getNDateBefore } from "../../utils/utils";
import RadialCard from "../Chart/RadialCard";
import Table from "../Table";
import { SectionTitle } from "../Typography/Title";

function Capacity({ filterDistrict, date }) {
  const initialFacilitiesTrivia = {
    count: 0,
    oxygen: 0,
    ventilator: { total: 0, used: 0 },
    icu: { total: 0, used: 0 },
    room: { total: 0, used: 0 },
    bed: { total: 0, used: 0 },
  };

  const { auth } = useContext(AuthContext);
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [facilitiesTrivia, setFacilitiesTrivia] = useState({
    current: initialFacilitiesTrivia,
    previous: initialFacilitiesTrivia,
  });

  useEffect(() => {
    careFacilitySummary(
      auth.token,
      dateString(getNDateBefore(date, 1)),
      dateString(getNDateAfter(date, 1))
    )
      .then((resp) => {
        setFacilities(
          resp.results.map(({ data: facility, created_date }) => ({
            date: dateString(new Date(created_date)),
            id: facility.id,
            name: facility.name,
            districtId: facility.district,
            facilityType: facility.facility_type || "Unknown",
            oxygenCapacity: facility.oxygen_capacity,
            capacity: facility.availability.reduce((cAcc, cCur) => {
              return {
                ...cAcc,
                [cCur.room_type]: cCur,
              };
            }, {}),
          }))
        );
      })
      .catch((ex) => {
        console.error("Data Unavailable", ex);
      });
  }, [date]);

  useEffect(() => {
    if (facilities.length == 0) {
      return;
    }
    let _f = facilities.filter((f) => f.districtId === filterDistrict.id);
    setFilteredFacilities(_f);
    let _t = _f.reduce(
      (a, c) => {
        let key = c.date === dateString(date) ? "current" : "previous";
        a[key].count += 1;
        a[key].oxygen += c.oxygenCapacity || 0;
        Object.keys(availabilityTypes).forEach((k) => {
          a[key][availabilityTypes[k]].used +=
            c.capacity[k]?.current_capacity || 0;
          a[key][availabilityTypes[k]].total +=
            c.capacity[k]?.total_capacity || 0;
        });
        return a;
      },
      {
        current: JSON.parse(JSON.stringify(initialFacilitiesTrivia)),
        previous: JSON.parse(JSON.stringify(initialFacilitiesTrivia)),
      }
    );
    setFacilitiesTrivia(_t);
  }, [facilities, filterDistrict]);

  return (
    <>
      <div className="flex flex-row justify-between">
        <SectionTitle>
          Facility Count: {facilitiesTrivia.current.count}
        </SectionTitle>
        <SectionTitle>
          Oxygen Capacity: {facilitiesTrivia.current.oxygen}
        </SectionTitle>
      </div>
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {["ventilator", "icu", "room", "bed"].map((k) => (
          <RadialCard
            label={k[0].toUpperCase() + k.slice(1) + "s used"}
            dataKey={k}
            data={facilitiesTrivia}
            key={k}
          />
        ))}
      </div>

      <SectionTitle>Facilities</SectionTitle>
      <Table
        className="mb-8"
        columns={["Name", "Oxygen", "Ventilator", "ICU", "Room", "Bed"]}
        data={filteredFacilities.reduce((a, c) => {
          if (c.date !== dateString(date)) {
            return a;
          }
          return [
            ...a,
            [
              <div className="flex flex-col">
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {c.facilityType}
                </p>
              </div>,
              c.oxygenCapacity,
              ...Object.keys(availabilityTypes).map((i) =>
                c.capacity[i]?.total_capacity
                  ? `${c.capacity[i]?.current_capacity}/${c.capacity[i]?.total_capacity}`
                  : "-"
              ),
            ],
          ];
        }, [])}
      ></Table>
    </>
  );
}

export default Capacity;
